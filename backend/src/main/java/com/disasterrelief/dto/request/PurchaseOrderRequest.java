package com.disasterrelief.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseOrderRequest {
    @NotNull(message = "Supplier is required")
    private Long supplierId;

    @NotNull(message = "Hub is required")
    private Long hubId;

    private Long campaignId;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private String notes;

    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<PurchaseOrderItemRequest> items;

    @Data
    public static class PurchaseOrderItemRequest {
        @NotNull(message = "Product is required")
        private Long productId;

        @NotNull @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        @NotNull @DecimalMin(value = "0.01", message = "Unit price must be positive")
        private BigDecimal unitPrice;
    }
}
