package com.disasterrelief.dto.response;

import com.disasterrelief.entity.Camp;
import com.disasterrelief.entity.ResourceRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class ResourceRequestResponse {
    private Long id;
    private String requestNumber;
    private Long campId;
    private String campName;
    private String campLocation;
    private Long campaignId;
    private String campaignName;
    private String reason;
    private Camp.Priority priority;
    private ResourceRequest.RequestStatus status;
    private boolean isSos;
    private String emergencyType;
    private String sosLocation;
    private String requestedByName;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private List<ItemResponse> items;
    private LocalDateTime createdAt;

    @Data @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Integer requestedQuantity;
        private Integer approvedQuantity;
        private Integer allocatedQuantity;
    }
}
