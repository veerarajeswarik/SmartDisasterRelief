package com.disasterrelief.dto.request;

import com.disasterrelief.entity.FundAccount;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FundAccountRequest {
    @NotBlank(message = "Account name is required")
    private String accountName;

    @NotNull(message = "Account type is required")
    private FundAccount.AccountType accountType;

    private BigDecimal initialBalance;
    private String description;
    private Long campaignId;
    private boolean active = true;
}
