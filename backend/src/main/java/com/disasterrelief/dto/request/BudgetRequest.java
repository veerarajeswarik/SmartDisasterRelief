package com.disasterrelief.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {
    @NotNull(message = "Campaign is required")
    private Long campaignId;

    @NotNull @DecimalMin(value = "0.0", message = "Allocated amount must be non-negative")
    private BigDecimal allocatedAmount;

    private BigDecimal procurementBudget;
    private BigDecimal dispatchBudget;
    private BigDecimal otherExpensesBudget;
    private String notes;
}
 