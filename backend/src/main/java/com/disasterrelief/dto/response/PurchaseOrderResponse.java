package com.disasterrelief.dto.response;

import com.disasterrelief.entity.PurchaseOrder;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class PurchaseOrderResponse {
    private Long id;
    private String poNumber;
    private Long supplierId;
    private String supplierName;
    private Long hubId;
    private String hubName;
    private Long campaignId;
    private String campaignName;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private BigDecimal totalAmount;
    private PurchaseOrder.POStatus status;
    private String notes;
    private String createdByName;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private LocalDateTime receivedAt;
    private List<ItemResponse> items;
    private LocalDateTime createdAt;

    @Data @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productCode;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private Integer receivedQuantity;
    }
}
