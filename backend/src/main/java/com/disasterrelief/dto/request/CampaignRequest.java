package com.disasterrelief.dto.request;

import com.disasterrelief.entity.Campaign;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CampaignRequest {
    @NotBlank(message = "Campaign name is required")
    @Size(max = 200)
    private String name;

    @NotNull(message = "Disaster type is required")
    private Campaign.DisasterType disasterType;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;
    private LocalDate startDate;
    private LocalDate endDate;

    @Min(value = 0, message = "Affected population must be non-negative")
    private Integer affectedPopulation;

    @DecimalMin(value = "0.0", message = "Budget must be non-negative")
    private BigDecimal allocatedBudget;

    private Campaign.CampaignStatus status;
}
