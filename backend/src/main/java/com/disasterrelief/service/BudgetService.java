package com.disasterrelief.service;

import com.disasterrelief.dto.request.BudgetRequest;
import com.disasterrelief.dto.response.BudgetResponse;
import com.disasterrelief.entity.Budget;
import com.disasterrelief.entity.Campaign;
import com.disasterrelief.entity.Notification;
import com.disasterrelief.exception.BusinessException;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.BudgetRepository;
import com.disasterrelief.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CampaignRepository campaignRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public List<BudgetResponse> findAll() {
        return budgetRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BudgetResponse findById(Long id) {
        return toResponse(budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id)));
    }

    public BudgetResponse findByCampaign(Long campaignId) {
        return toResponse(budgetRepository.findByCampaignId(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget for campaign " + campaignId)));
    }

    @Transactional
    public BudgetResponse create(BudgetRequest request) {
        if (budgetRepository.existsByCampaignId(request.getCampaignId()))
            throw new BusinessException("A budget already exists for this campaign");
        Campaign campaign = campaignRepository.findById(request.getCampaignId())
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", request.getCampaignId()));

        Budget budget = Budget.builder()
                .campaign(campaign)
                .allocatedAmount(request.getAllocatedAmount())
                .procurementBudget(request.getProcurementBudget() != null ? request.getProcurementBudget() : BigDecimal.ZERO)
                .dispatchBudget(request.getDispatchBudget() != null ? request.getDispatchBudget() : BigDecimal.ZERO)
                .otherExpensesBudget(request.getOtherExpensesBudget() != null ? request.getOtherExpensesBudget() : BigDecimal.ZERO)
                .actualExpenditure(BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();
        Budget saved = budgetRepository.save(budget);
        auditService.log("CREATE", "Budget", saved.getId(), "Created budget for campaign: " + campaign.getName());
        return toResponse(saved);
    }

    @Transactional
    public BudgetResponse update(Long id, BudgetRequest request) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id));
        budget.setAllocatedAmount(request.getAllocatedAmount());
        if (request.getProcurementBudget() != null) budget.setProcurementBudget(request.getProcurementBudget());
        if (request.getDispatchBudget() != null) budget.setDispatchBudget(request.getDispatchBudget());
        if (request.getOtherExpensesBudget() != null) budget.setOtherExpensesBudget(request.getOtherExpensesBudget());
        budget.setNotes(request.getNotes());
        auditService.log("UPDATE", "Budget", id, "Updated budget");
        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void addExpenditure(Long campaignId, BigDecimal amount) {
        budgetRepository.findByCampaignId(campaignId).ifPresent(budget -> {
            budget.setActualExpenditure(budget.getActualExpenditure().add(amount));
            budgetRepository.save(budget);
            double utilization = budget.getUtilizationPercentage();
            if (utilization > 85) {
                notificationService.createBroadcastNotification(
                        "High Budget Utilization",
                        "Campaign budget utilization is " + String.format("%.1f", utilization) + "%. Consider reviewing.",
                        Notification.NotificationType.BUDGET_ALERT, Notification.NotificationSeverity.WARNING);
            }
        });
    }

    private BudgetResponse toResponse(Budget b) {
        double utilization = b.getUtilizationPercentage();
        String utilizationStatus = utilization > 85 ? "HIGH" : utilization > 70 ? "WARNING" : "NORMAL";
        return BudgetResponse.builder()
                .id(b.getId())
                .campaignId(b.getCampaign().getId())
                .campaignName(b.getCampaign().getName())
                .allocatedAmount(b.getAllocatedAmount())
                .procurementBudget(b.getProcurementBudget())
                .dispatchBudget(b.getDispatchBudget())
                .otherExpensesBudget(b.getOtherExpensesBudget())
                .actualExpenditure(b.getActualExpenditure())
                .remainingAmount(b.getRemainingAmount())
                .utilizationPercentage(utilization)
                .utilizationStatus(utilizationStatus)
                .notes(b.getNotes())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
