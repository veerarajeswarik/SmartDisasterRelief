package com.disasterrelief.service;

import com.disasterrelief.dto.request.CampaignRequest;
import com.disasterrelief.dto.response.CampaignResponse;
import com.disasterrelief.entity.Campaign;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final AuditService auditService;

    public List<CampaignResponse> findAll() {
        return campaignRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<CampaignResponse> findByStatus(Campaign.CampaignStatus status) {
        return campaignRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CampaignResponse findById(Long id) {
        return toResponse(getCampaign(id));
    }

    @Transactional
    public CampaignResponse create(CampaignRequest request) {
        Campaign campaign = Campaign.builder()
                .campaignCode(generateCode())
                .name(request.getName())
                .disasterType(request.getDisasterType())
                .location(request.getLocation())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .affectedPopulation(request.getAffectedPopulation())
                .allocatedBudget(request.getAllocatedBudget())
                .status(request.getStatus() != null ? request.getStatus() : Campaign.CampaignStatus.PLANNED)
                .build();
        Campaign saved = campaignRepository.save(campaign);
        auditService.log("CREATE", "Campaign", saved.getId(), "Created campaign: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public CampaignResponse update(Long id, CampaignRequest request) {
        Campaign campaign = getCampaign(id);
        campaign.setName(request.getName());
        campaign.setDisasterType(request.getDisasterType());
        campaign.setLocation(request.getLocation());
        campaign.setDescription(request.getDescription());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        campaign.setAffectedPopulation(request.getAffectedPopulation());
        campaign.setAllocatedBudget(request.getAllocatedBudget());
        if (request.getStatus() != null) campaign.setStatus(request.getStatus());
        auditService.log("UPDATE", "Campaign", id, "Updated campaign: " + campaign.getName());
        return toResponse(campaignRepository.save(campaign));
    }

    public Campaign getCampaign(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", id));
    }

    private String generateCode() {
        long count = campaignRepository.count() + 1;
        return "CAMP-" + String.format("%04d", count);
    }

    private CampaignResponse toResponse(Campaign c) {
        return CampaignResponse.builder()
                .id(c.getId())
                .campaignCode(c.getCampaignCode())
                .name(c.getName())
                .disasterType(c.getDisasterType())
                .location(c.getLocation())
                .description(c.getDescription())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .affectedPopulation(c.getAffectedPopulation())
                .allocatedBudget(c.getAllocatedBudget())
                .status(c.getStatus())
                .campCount(c.getCamps() != null ? c.getCamps().size() : 0)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
