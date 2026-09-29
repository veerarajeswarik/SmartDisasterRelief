package com.disasterrelief.service;

import com.disasterrelief.dto.request.CampRequest;
import com.disasterrelief.dto.response.CampResponse;
import com.disasterrelief.entity.Camp;
import com.disasterrelief.entity.Campaign;
import com.disasterrelief.entity.ReliefHub;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.CampRepository;
import com.disasterrelief.repository.CampaignRepository;
import com.disasterrelief.repository.ReliefHubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CampService {

    private final CampRepository campRepository;
    private final CampaignRepository campaignRepository;
    private final ReliefHubRepository reliefHubRepository;
    private final AuditService auditService;

    public List<CampResponse> findAll() {
        return campRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<CampResponse> findByCampaign(Long campaignId) {
        return campRepository.findByCampaignId(campaignId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CampResponse findById(Long id) {
        return toResponse(getCamp(id));
    }

    @Transactional
    public CampResponse create(CampRequest request) {
        Campaign campaign = request.getCampaignId() != null ?
                campaignRepository.findById(request.getCampaignId()).orElse(null) : null;
        ReliefHub hub = request.getAssignedHubId() != null ?
                reliefHubRepository.findById(request.getAssignedHubId()).orElse(null) : null;

        Camp camp = Camp.builder()
                .campCode(generateCode())
                .name(request.getName())
                .location(request.getLocation())
                .representative(request.getRepresentative())
                .contact(request.getContact())
                .population(request.getPopulation())
                .campaign(campaign)
                .assignedHub(hub)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .priority(request.getPriority() != null ? request.getPriority() : Camp.Priority.MEDIUM)
                .status(request.getStatus() != null ? request.getStatus() : Camp.CampStatus.ACTIVE)
                .build();
        Camp saved = campRepository.save(camp);
        auditService.log("CREATE", "Camp", saved.getId(), "Created camp: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public CampResponse update(Long id, CampRequest request) {
        Camp camp = getCamp(id);
        camp.setName(request.getName());
        camp.setLocation(request.getLocation());
        camp.setRepresentative(request.getRepresentative());
        camp.setContact(request.getContact());
        camp.setPopulation(request.getPopulation());
        camp.setLatitude(request.getLatitude());
        camp.setLongitude(request.getLongitude());
        if (request.getPriority() != null) camp.setPriority(request.getPriority());
        if (request.getStatus() != null) camp.setStatus(request.getStatus());
        if (request.getCampaignId() != null)
            camp.setCampaign(campaignRepository.findById(request.getCampaignId()).orElse(null));
        if (request.getAssignedHubId() != null)
            camp.setAssignedHub(reliefHubRepository.findById(request.getAssignedHubId()).orElse(null));
        auditService.log("UPDATE", "Camp", id, "Updated camp: " + camp.getName());
        return toResponse(campRepository.save(camp));
    }

    public Camp getCamp(Long id) {
        return campRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Camp", id));
    }

    private String generateCode() {
        long count = campRepository.count() + 1;
        return "CAMP-" + String.format("%04d", count);
    }

    private CampResponse toResponse(Camp c) {
        return CampResponse.builder()
                .id(c.getId())
                .campCode(c.getCampCode())
                .name(c.getName())
                .location(c.getLocation())
                .representative(c.getRepresentative())
                .contact(c.getContact())
                .population(c.getPopulation())
                .campaignId(c.getCampaign() != null ? c.getCampaign().getId() : null)
                .campaignName(c.getCampaign() != null ? c.getCampaign().getName() : null)
                .assignedHubId(c.getAssignedHub() != null ? c.getAssignedHub().getId() : null)
                .assignedHubName(c.getAssignedHub() != null ? c.getAssignedHub().getName() : null)
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .priority(c.getPriority())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
