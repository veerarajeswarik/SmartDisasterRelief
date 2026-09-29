package com.disasterrelief.dto.response;

import com.disasterrelief.entity.Product;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ProductResponse {
    private Long id;
    private String productCode;
    private String name;
    private Product.ProductCategory category;
    private String unit;
    private String description;
    private Integer minimumStockLevel;
    private Integer maximumStockCapacity;
    private Integer reorderLevel;
    private boolean active;
    private LocalDateTime createdAt;
}
