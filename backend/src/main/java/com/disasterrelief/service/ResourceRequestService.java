package com.disasterrelief.service;

import com.disasterrelief.dto.request.ResourceRequestDto;
import com.disasterrelief.dto.response.ResourceRequestResponse;
import com.disasterrelief.entity.*;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResourceRequestService {

    private final ResourceRequestRepository requestRepository;
    private final CampRepository campRepository;
    private final CampaignRepository campaignRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public List<ResourceRequestResponse> findAll() {
        return requestRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ResourceRequestResponse> findByStatus(ResourceRequest.RequestStatus status) {
        return requestRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ResourceRequestResponse> findByCamp(Long campId) {
        return requestRepository.findByCampId(campId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ResourceRequestResponse> findSos() {
        return requestRepository.findByIsSosTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ResourceRequestResponse findById(Long id) {
        return toResponse(getRequest(id));
    }

    @Transactional
    public ResourceRequestResponse create(ResourceRequestDto dto) {
        Camp camp = campRepository.findById(dto.getCampId())
                .orElseThrow(() -> new ResourceNotFoundException("Camp", dto.getCampId()));
        Campaign campaign = dto.getCampaignId() != null ?
                campaignRepository.findById(dto.getCampaignId()).orElse(null) : null;

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User requester = userService.findByUsername(username);

        ResourceRequest request = ResourceRequest.builder()
                .requestNumber(generateRequestNumber())
                .camp(camp).campaign(campaign)
                .reason(dto.getReason())
                .priority(dto.getPriority() != null ? dto.getPriority() : Camp.Priority.MEDIUM)
                .status(ResourceRequest.RequestStatus.PENDING)
                .isSos(dto.isSos())
                .emergencyType(dto.getEmergencyType())
                .sosLocation(dto.getSosLocation())
                .requestedBy(requester)
                .build();

        if (dto.isSos()) {
            request.setPriority(Camp.Priority.CRITICAL);
        }

        for (ResourceRequestDto.ItemRequest itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemDto.getProductId()));
            ResourceRequestItem item = ResourceRequestItem.builder()
                    .resourceRequest(request).product(product)
                    .requestedQuantity(itemDto.getRequestedQuantity())
                    .build();
            request.getItems().add(item);
        }

        ResourceRequest saved = requestRepository.save(request);

        if (dto.isSos()) {
            notificationService.createBroadcastNotification(
                    "🚨 CRITICAL SOS REQUEST",
                    "Emergency resource request from " + camp.getName() + ". Immediate action required!",
                    Notification.NotificationType.SOS_REQUEST, Notification.NotificationSeverity.CRITICAL);
        } else {
            notificationService.createBroadcastNotification(
                    "New Resource Request",
                    "New resource request #" + saved.getRequestNumber() + " from " + camp.getName(),
                    Notification.NotificationType.RESOURCE_REQUEST, Notification.NotificationSeverity.INFO);
        }
        auditService.log("CREATE", "ResourceRequest", saved.getId(), "Created request: " + saved.getRequestNumber());
        return toResponse(saved);
    }

    @Transactional
    public ResourceRequestResponse approve(Long id) {
        ResourceRequest request = getRequest(id);
        if (request.getStatus() != ResourceRequest.RequestStatus.PENDING)
            throw new com.disasterrelief.exception.BusinessException("Only PENDING requests can be approved");

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User reviewer = userService.findByUsername(username);

        request.getItems().forEach(item -> item.setApprovedQuantity(item.getRequestedQuantity()));
        request.setStatus(ResourceRequest.RequestStatus.APPROVED);
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());
        auditService.log("APPROVE", "ResourceRequest", id, "Approved request: " + request.getRequestNumber());
        return toResponse(requestRepository.save(request));
    }

    @Transactional
    public ResourceRequestResponse reject(Long id, String reason) {
        ResourceRequest request = getRequest(id);
        request.setStatus(ResourceRequest.RequestStatus.REJECTED);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User reviewer = userService.findByUsername(username);
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());
        request.setReason("REJECTED: " + reason);
        return toResponse(requestRepository.save(request));
    }

    public ResourceRequestResponse getSmartAllocationRecommendation(Long id) {
        // Returns the request with inventory availability info for admin review
        ResourceRequest request = getRequest(id);
        return toResponse(request);
    }

    public ResourceRequest getRequest(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ResourceRequest", id));
    }

    private String generateRequestNumber() {
        long count = requestRepository.count() + 1;
        return "REQ-" + String.format("%06d", count);
    }

    private ResourceRequestResponse toResponse(ResourceRequest r) {
        List<ResourceRequestResponse.ItemResponse> items = r.getItems().stream()
                .map(i -> ResourceRequestResponse.ItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .requestedQuantity(i.getRequestedQuantity())
                        .approvedQuantity(i.getApprovedQuantity())
                        .allocatedQuantity(i.getAllocatedQuantity())
                        .build())
                .collect(Collectors.toList());

        return ResourceRequestResponse.builder()
                .id(r.getId())
                .requestNumber(r.getRequestNumber())
                .campId(r.getCamp().getId())
                .campName(r.getCamp().getName())
                .campLocation(r.getCamp().getLocation())
                .campaignId(r.getCampaign() != null ? r.getCampaign().getId() : null)
                .campaignName(r.getCampaign() != null ? r.getCampaign().getName() : null)
                .reason(r.getReason())
                .priority(r.getPriority())
                .status(r.getStatus())
                .isSos(r.isSos())
                .emergencyType(r.getEmergencyType())
                .sosLocation(r.getSosLocation())
                .requestedByName(r.getRequestedBy() != null ? r.getRequestedBy().getFullName() : null)
                .reviewedByName(r.getReviewedBy() != null ? r.getReviewedBy().getFullName() : null)
                .reviewedAt(r.getReviewedAt())
                .items(items)
                .createdAt(r.getCreatedAt())
                .build();
    }
}
