package com.disasterrelief.dto.response;

import com.disasterrelief.entity.FundAccount;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class FundAccountResponse {
    private Long id;
    private String accountCode;
    private String accountName;
    private FundAccount.AccountType accountType;
    private BigDecimal balance;
    private String description;
    private Long campaignId;
    private String campaignName;
    private boolean active;
    private LocalDateTime createdAt;
}
