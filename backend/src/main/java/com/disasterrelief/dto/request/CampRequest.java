package com.disasterrelief.dto.request;

import com.disasterrelief.entity.Camp;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CampRequest {
    @NotBlank(message = "Camp name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    private String representative;
    private String contact;

    @Min(value = 0)
    private Integer population;

    private Long campaignId;
    private Long assignedHubId;
    private Double latitude;
    private Double longitude;
    private Camp.Priority priority;
    private Camp.CampStatus status;
}
