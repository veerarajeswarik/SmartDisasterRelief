package com.disasterrelief.dto.response;

import com.disasterrelief.entity.Camp;
import com.disasterrelief.entity.Dispatch;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class DispatchResponse {
    private Long id;
    private String dispatchNumber;
    private Long campaignId;
    private String campaignName;
    private Long sourceHubId;
    private String sourceHubName;
    private Long destinationCampId;
    private String destinationCampName;
    private Long resourceRequestId;
    private String vehicle;
    private String driverContact;
    private LocalDate dispatchDate;
    private LocalDate expectedDeliveryDate;
    private LocalDate actualDeliveryDate;
    private Camp.Priority priority;
    private Dispatch.DispatchStatus status;
    private String notes;
    private String createdByName;
    private String approvedByName;
    private List<ItemResponse> items;
    private LocalDateTime createdAt;

    @Data @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private Integer deliveredQuantity;
    }
}
