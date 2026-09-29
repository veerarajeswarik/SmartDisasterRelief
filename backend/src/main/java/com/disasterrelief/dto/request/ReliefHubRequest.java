package com.disasterrelief.dto.request;

import com.disasterrelief.entity.ReliefHub;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReliefHubRequest {
    @NotBlank(message = "Hub name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    private String address;
    private String contactPerson;
    private String contactNumber;

    @Min(value = 0, message = "Storage capacity must be non-negative")
    private Integer storageCapacity;

    private Double latitude;
    private Double longitude;
    private ReliefHub.HubStatus status;
}
