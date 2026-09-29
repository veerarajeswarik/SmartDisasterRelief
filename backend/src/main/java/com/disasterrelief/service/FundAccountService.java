package com.disasterrelief.service;

import com.disasterrelief.dto.request.FundAccountRequest;
import com.disasterrelief.dto.response.FundAccountResponse;
import com.disasterrelief.entity.Campaign;
import com.disasterrelief.entity.FundAccount;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.CampaignRepository;
import com.disasterrelief.repository.FundAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FundAccountService {

    private final FundAccountRepository fundAccountRepository;
    private final CampaignRepository campaignRepository;
    private final AuditService auditService;

    public List<FundAccountResponse> findAll() {
        return fundAccountRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public FundAccountResponse findById(Long id) {
        return toResponse(fundAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FundAccount", id)));
    }

    @Transactional
    public FundAccountResponse create(FundAccountRequest request) {
        Campaign campaign = request.getCampaignId() != null ?
                campaignRepository.findById(request.getCampaignId()).orElse(null) : null;
        FundAccount account = FundAccount.builder()
                .accountCode(generateCode())
                .accountName(request.getAccountName())
                .accountType(request.getAccountType())
                .balance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .description(request.getDescription())
                .campaign(campaign)
                .active(request.isActive())
                .build();
        FundAccount saved = fundAccountRepository.save(account);
        auditService.log("CREATE", "FundAccount", saved.getId(), "Created fund account: " + saved.getAccountName());
        return toResponse(saved);
    }

    @Transactional
    public void updateBalance(Long accountId, BigDecimal debit, BigDecimal credit) {
        FundAccount account = fundAccountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("FundAccount", accountId));
        account.setBalance(account.getBalance().add(credit).subtract(debit));
        fundAccountRepository.save(account);
    }

    private String generateCode() {
        long count = fundAccountRepository.count() + 1;
        return "ACC-" + String.format("%04d", count);
    }

    private FundAccountResponse toResponse(FundAccount f) {
        return FundAccountResponse.builder()
                .id(f.getId())
                .accountCode(f.getAccountCode())
                .accountName(f.getAccountName())
                .accountType(f.getAccountType())
                .balance(f.getBalance())
                .description(f.getDescription())
                .campaignId(f.getCampaign() != null ? f.getCampaign().getId() : null)
                .campaignName(f.getCampaign() != null ? f.getCampaign().getName() : null)
                .active(f.isActive())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
