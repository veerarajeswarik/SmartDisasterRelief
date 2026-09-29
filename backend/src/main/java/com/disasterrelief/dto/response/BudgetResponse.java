package com.disasterrelief.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class BudgetResponse {
    private Long id;
    private Long campaignId;
    private String campaignName;
    private BigDecimal allocatedAmount;
    private BigDecimal procurementBudget;
    private BigDecimal dispatchBudget;
    private BigDecimal otherExpensesBudget;
    private BigDecimal actualExpenditure;
    private BigDecimal remainingAmount;
    private double utilizationPercentage;
    private String utilizationStatus;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
