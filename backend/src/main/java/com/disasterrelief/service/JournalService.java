package com.disasterrelief.service;

import com.disasterrelief.dto.request.JournalEntryRequest;
import com.disasterrelief.dto.response.JournalEntryResponse;
import com.disasterrelief.entity.*;
import com.disasterrelief.exception.BusinessException;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JournalService {

    private final JournalEntryRepository journalRepository;
    private final LedgerEntryRepository ledgerRepository;
    private final FundAccountRepository fundAccountRepository;
    private final CampaignRepository campaignRepository;
    private final UserService userService;
    private final FundAccountService fundAccountService;

    public List<JournalEntryResponse> findAll() {
        return journalRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public JournalEntryResponse findById(Long id) {
        return toResponse(journalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JournalEntry", id)));
    }

    @Transactional
    public JournalEntryResponse create(JournalEntryRequest request) {
        // Validate balanced entry
        BigDecimal totalDebits = request.getLines().stream()
                .map(l -> l.getDebitAmount() != null ? l.getDebitAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredits = request.getLines().stream()
                .map(l -> l.getCreditAmount() != null ? l.getCreditAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalDebits.compareTo(totalCredits) != 0)
            throw new BusinessException("Journal entry must be balanced: Debits (" + totalDebits + ") must equal Credits (" + totalCredits + ")");

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User creator = userService.findByUsername(username);
        Campaign campaign = request.getCampaignId() != null ?
                campaignRepository.findById(request.getCampaignId()).orElse(null) : null;

        JournalEntry entry = JournalEntry.builder()
                .entryNumber(generateEntryNumber())
                .entryDate(request.getEntryDate())
                .journalType(request.getJournalType())
                .description(request.getDescription())
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .totalAmount(totalDebits)
                .campaign(campaign)
                .createdBy(creator)
                .build();

        for (JournalEntryRequest.LedgerLineRequest lineReq : request.getLines()) {
            FundAccount account = fundAccountRepository.findById(lineReq.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("FundAccount", lineReq.getAccountId()));

            BigDecimal debit = lineReq.getDebitAmount() != null ? lineReq.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal credit = lineReq.getCreditAmount() != null ? lineReq.getCreditAmount() : BigDecimal.ZERO;

            LedgerEntry ledger = LedgerEntry.builder()
                    .journalEntry(entry).account(account)
                    .entryDate(request.getEntryDate())
                    .description(lineReq.getDescription())
                    .debitAmount(debit)
                    .creditAmount(credit)
                    .build();
            entry.getLedgerEntries().add(ledger);

            // Update account balance
            fundAccountService.updateBalance(account.getId(), debit, credit);
        }

        return toResponse(journalRepository.save(entry));
    }

    private String generateEntryNumber() {
        long count = journalRepository.count() + 1;
        return "JE-" + String.format("%06d", count);
    }

    private JournalEntryResponse toResponse(JournalEntry je) {
        List<JournalEntryResponse.LedgerLineResponse> lines = je.getLedgerEntries().stream()
                .map(l -> JournalEntryResponse.LedgerLineResponse.builder()
                        .id(l.getId())
                        .accountId(l.getAccount().getId())
                        .accountName(l.getAccount().getAccountName())
                        .accountType(l.getAccount().getAccountType().name())
                        .description(l.getDescription())
                        .debitAmount(l.getDebitAmount())
                        .creditAmount(l.getCreditAmount())
                        .build())
                .collect(Collectors.toList());

        return JournalEntryResponse.builder()
                .id(je.getId())
                .entryNumber(je.getEntryNumber())
                .entryDate(je.getEntryDate())
                .journalType(je.getJournalType())
                .description(je.getDescription())
                .referenceType(je.getReferenceType())
                .referenceId(je.getReferenceId())
                .totalAmount(je.getTotalAmount())
                .campaignId(je.getCampaign() != null ? je.getCampaign().getId() : null)
                .campaignName(je.getCampaign() != null ? je.getCampaign().getName() : null)
                .createdByName(je.getCreatedBy() != null ? je.getCreatedBy().getFullName() : null)
                .lines(lines)
                .createdAt(je.getCreatedAt())
                .build();
    }
}
