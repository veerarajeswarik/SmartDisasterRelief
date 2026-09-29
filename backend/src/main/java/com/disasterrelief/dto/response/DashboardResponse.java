package com.disasterrelief.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DashboardResponse {
    // KPI Cards
    private long activeCampaigns;
    private long reliefHubs;
    private long totalInventoryItems;
    private long pendingRequests;
    private long activeDispatches;
    private long criticalStockItems;
    private BigDecimal availableFunds;
    private double avgBudgetUtilization;

    // Charts
    private List<InventoryChartData> inventoryOverview;
    private Map<String, Long> dispatchOverview;
    private List<BudgetChartData> budgetUtilization;
    private List<RecentActivity> recentActivities;
    private List<CriticalStockAlert> criticalAlerts;

    @Data @Builder
    public static class InventoryChartData {
        private String productName;
        private String hub;
        private Integer quantity;
        private Integer maxCapacity;
        private double percentage;
    }

    @Data @Builder
    public static class BudgetChartData {
        private String campaignName;
        private BigDecimal allocated;
        private BigDecimal spent;
        private BigDecimal remaining;
        private double utilization;
    }

    @Data @Builder
    public static class RecentActivity {
        private String type;
        private String description;
        private String timestamp;
        private String severity;
    }

    @Data @Builder
    public static class CriticalStockAlert {
        private Long inventoryId;
        private String productName;
        private String hubName;
        private Integer currentStock;
        private Integer maxCapacity;
        private double stockPercentage;
        private String status;
    }
}
