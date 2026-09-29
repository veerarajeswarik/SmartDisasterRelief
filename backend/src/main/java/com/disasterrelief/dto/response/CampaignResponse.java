package com.disasterrelief.dto.response;

import com.disasterrelief.entity.Campaign;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class CampaignResponse {
    private Long id;
    private String campaignCode;
    private String name;
    private Campaign.DisasterType disasterType;
    private String location;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer affectedPopulation;
    private BigDecimal allocatedBudget;
    private Campaign.CampaignStatus status;
    private int campCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
