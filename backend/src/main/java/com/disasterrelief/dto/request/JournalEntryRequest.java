package com.disasterrelief.dto.request;

import com.disasterrelief.entity.JournalEntry;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class JournalEntryRequest {
    @NotNull(message = "Entry date is required")
    private LocalDate entryDate;

    @NotNull(message = "Journal type is required")
    private JournalEntry.JournalType journalType;

    @NotBlank(message = "Description is required")
    private String description;

    private Long campaignId;
    private String referenceType;
    private Long referenceId;

    @NotEmpty(message = "At least one ledger line is required")
    @Valid
    private List<LedgerLineRequest> lines;

    @Data
    public static class LedgerLineRequest {
        @NotNull(message = "Account is required")
        private Long accountId;

        @NotBlank
        private String description;

        private BigDecimal debitAmount;
        private BigDecimal creditAmount;
    }
}
