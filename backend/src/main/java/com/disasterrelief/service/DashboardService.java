package com.disasterrelief.service;

import com.disasterrelief.dto.response.DashboardResponse;
import com.disasterrelief.entity.*;
import com.disasterrelief.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final CampaignRepository campaignRepository;
    private final ReliefHubRepository hubRepository;
    private final InventoryRepository inventoryRepository;
    private final ResourceRequestRepository requestRepository;
    private final DispatchRepository dispatchRepository;
    private final BudgetRepository budgetRepository;
    private final FundAccountRepository fundAccountRepository;
    private final InventoryTransactionRepository transactionRepository;

    public DashboardResponse getDashboard() {
        // KPIs
        long activeCampaigns = campaignRepository.countByStatus(Campaign.CampaignStatus.ACTIVE);
        long reliefHubs = hubRepository.countByStatus(ReliefHub.HubStatus.ACTIVE);
        long totalInventoryItems = inventoryRepository.count();
        long pendingRequests = requestRepository.countByStatus(ResourceRequest.RequestStatus.PENDING);
        long activeDispatches = dispatchRepository.countByStatus(Dispatch.DispatchStatus.IN_TRANSIT) +
                dispatchRepository.countByStatus(Dispatch.DispatchStatus.PREPARING);
        long criticalStock = inventoryRepository.countCriticalStockItems();
        BigDecimal availableFunds = fundAccountRepository.sumBankBalance();

        // Budget utilization
        List<Budget> budgets = budgetRepository.findAll();
        double avgUtilization = budgets.isEmpty() ? 0 :
                budgets.stream().mapToDouble(Budget::getUtilizationPercentage).average().orElse(0);

        // Inventory overview (top 8)
        List<Inventory> allInventory = inventoryRepository.findAll();
        List<DashboardResponse.InventoryChartData> inventoryChart = allInventory.stream()
                .filter(i -> i.getMaximumStockCapacity() != null && i.getMaximumStockCapacity() > 0)
                .limit(8)
                .map(i -> DashboardResponse.InventoryChartData.builder()
                        .productName(i.getProduct().getName())
                        .hub(i.getHub().getName())
                        .quantity(i.getQuantityOnHand())
                        .maxCapacity(i.getMaximumStockCapacity())
                        .percentage(i.getStockPercentage())
                        .build())
                .collect(Collectors.toList());

        // Dispatch overview
        Map<String, Long> dispatchOverview = new HashMap<>();
        dispatchOverview.put("REQUESTED", dispatchRepository.countByStatus(Dispatch.DispatchStatus.REQUESTED));
        dispatchOverview.put("APPROVED", dispatchRepository.countByStatus(Dispatch.DispatchStatus.APPROVED));
        dispatchOverview.put("PREPARING", dispatchRepository.countByStatus(Dispatch.DispatchStatus.PREPARING));
        dispatchOverview.put("IN_TRANSIT", dispatchRepository.countByStatus(Dispatch.DispatchStatus.IN_TRANSIT));
        dispatchOverview.put("DELIVERED", dispatchRepository.countByStatus(Dispatch.DispatchStatus.DELIVERED));

        // Budget utilization chart
        List<DashboardResponse.BudgetChartData> budgetChart = budgets.stream()
                .map(b -> DashboardResponse.BudgetChartData.builder()
                        .campaignName(b.getCampaign().getName())
                        .allocated(b.getAllocatedAmount())
                        .spent(b.getActualExpenditure())
                        .remaining(b.getRemainingAmount())
                        .utilization(b.getUtilizationPercentage())
                        .build())
                .collect(Collectors.toList());

        // Recent activity
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd, HH:mm");
        List<DashboardResponse.RecentActivity> recentActivities = transactionRepository
                .findTop20ByOrderByCreatedAtDesc().stream()
                .map(t -> DashboardResponse.RecentActivity.builder()
                        .type("INVENTORY_" + t.getTransactionType().name())
                        .description(t.getTransactionType().name() + ": " + Math.abs(t.getQuantity()) +
                                " " + t.getProduct().getName() + " at " + t.getHub().getName())
                        .timestamp(t.getCreatedAt().format(fmt))
                        .severity("INFO")
                        .build())
                .collect(Collectors.toList());

        // Critical alerts
        List<DashboardResponse.CriticalStockAlert> criticalAlerts = inventoryRepository.findCriticalStockItems()
                .stream()
                .map(i -> DashboardResponse.CriticalStockAlert.builder()
                        .inventoryId(i.getId())
                        .productName(i.getProduct().getName())
                        .hubName(i.getHub().getName())
                        .currentStock(i.getQuantityOnHand())
                        .maxCapacity(i.getMaximumStockCapacity())
                        .stockPercentage(i.getStockPercentage())
                        .status(i.getStockStatus().name())
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .activeCampaigns(activeCampaigns)
                .reliefHubs(reliefHubs)
                .totalInventoryItems(totalInventoryItems)
                .pendingRequests(pendingRequests)
                .activeDispatches(activeDispatches)
                .criticalStockItems(criticalStock)
                .availableFunds(availableFunds)
                .avgBudgetUtilization(avgUtilization)
                .inventoryOverview(inventoryChart)
                .dispatchOverview(dispatchOverview)
                .budgetUtilization(budgetChart)
                .recentActivities(recentActivities)
                .criticalAlerts(criticalAlerts)
                .build();
    }
}
