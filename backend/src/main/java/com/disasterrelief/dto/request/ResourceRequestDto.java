package com.disasterrelief.dto.request;

import com.disasterrelief.entity.Camp;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class ResourceRequestDto {
    @NotNull(message = "Camp is required")
    private Long campId;

    private Long campaignId;
    private String reason;
    private Camp.Priority priority;

    private boolean isSos;
    private String emergencyType;
    private String sosLocation;

    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<ItemRequest> items;

    @Data
    public static class ItemRequest {
        @NotNull(message = "Product is required")
        private Long productId;

        @NotNull @Min(value = 1, message = "Quantity must be at least 1")
        private Integer requestedQuantity;
    }
}
