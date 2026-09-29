package com.disasterrelief.dto.request;

import com.disasterrelief.entity.Product;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Category is required")
    private Product.ProductCategory category;

    @NotBlank(message = "Unit is required")
    private String unit;

    private String description;

    @Min(value = 0)
    private Integer minimumStockLevel;

    @Min(value = 0)
    private Integer maximumStockCapacity;

    @Min(value = 0)
    private Integer reorderLevel;

    private boolean active = true;
}
