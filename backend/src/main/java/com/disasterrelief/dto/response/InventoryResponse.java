package com.disasterrelief.dto.response;

import com.disasterrelief.entity.Inventory;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class InventoryResponse {
    private Long id;
    private Long hubId;
    private String hubName;
    private Long productId;
    private String productName;
    private String productCode;
    private String productCategory;
    private String unit;
    private Integer quantityOnHand;
    private Integer minimumStockLevel;
    private Integer maximumStockCapacity;
    private Inventory.StockStatus stockStatus;
    private double stockPercentage;
    private LocalDateTime lastUpdated;
}
