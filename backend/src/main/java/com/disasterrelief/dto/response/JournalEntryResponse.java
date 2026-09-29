package com.disasterrelief.dto.response;

import com.disasterrelief.entity.JournalEntry;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class JournalEntryResponse {
    private Long id;
    private String entryNumber;
    private LocalDate entryDate;
    private JournalEntry.JournalType journalType;
    private String description;
    private String referenceType;
    private Long referenceId;
    private BigDecimal totalAmount;
    private Long campaignId;
    private String campaignName;
    private String createdByName;
    private List<LedgerLineResponse> lines;
    private LocalDateTime createdAt;

    @Data @Builder
    public static class LedgerLineResponse {
        private Long id;
        private Long accountId;
        private String accountName;
        private String accountType;
        private String description;
        private BigDecimal debitAmount;
        private BigDecimal creditAmount;
    }
}
