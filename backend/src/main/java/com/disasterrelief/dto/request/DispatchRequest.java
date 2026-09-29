package com.disasterrelief.dto.request;

import com.disasterrelief.entity.Camp;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class DispatchRequest {
    private Long campaignId;

    @NotNull(message = "Source hub is required")
    private Long sourceHubId;

    @NotNull(message = "Destination camp is required")
    private Long destinationCampId;

    private Long resourceRequestId;
    private String vehicle;
    private String driverContact;
    private LocalDate dispatchDate;
    private LocalDate expectedDeliveryDate;
    private Camp.Priority priority;
    private String notes;

    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<DispatchItemRequest> items;

    @Data
    public static class DispatchItemRequest {
        @NotNull(message = "Product is required")
        private Long productId;

        @NotNull @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
