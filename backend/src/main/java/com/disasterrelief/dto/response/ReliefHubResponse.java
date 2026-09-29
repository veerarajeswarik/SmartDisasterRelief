package com.disasterrelief.dto.response;

import com.disasterrelief.entity.ReliefHub;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ReliefHubResponse {
    private Long id;
    private String hubCode;
    private String name;
    private String location;
    private String address;
    private String contactPerson;
    private String contactNumber;
    private Integer storageCapacity;
    private Double latitude;
    private Double longitude;
    private ReliefHub.HubStatus status;
    private int inventoryItemCount;
    private int totalStockQuantity;
    private LocalDateTime createdAt;
}
