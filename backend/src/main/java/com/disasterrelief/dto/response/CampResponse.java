package com.disasterrelief.dto.response;

import com.disasterrelief.entity.Camp;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class CampResponse {
    private Long id;
    private String campCode;
    private String name;
    private String location;
    private String representative;
    private String contact;
    private Integer population;
    private Long campaignId;
    private String campaignName;
    private Long assignedHubId;
    private String assignedHubName;
    private Double latitude;
    private Double longitude;
    private Camp.Priority priority;
    private Camp.CampStatus status;
    private LocalDateTime createdAt;
}
