package com.disasterrelief.service;

import com.disasterrelief.dto.request.DispatchRequest;
import com.disasterrelief.dto.response.DispatchResponse;
import com.disasterrelief.entity.*;
import com.disasterrelief.exception.BusinessException;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DispatchService {

    private final DispatchRepository dispatchRepository;
    private final ReliefHubRepository hubRepository;
    private final CampRepository campRepository;
    private final CampaignRepository campaignRepository;
    private final ProductRepository productRepository;
    private final ResourceRequestRepository requestRepository;
    private final InventoryService inventoryService;
    private final UserService userService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public List<DispatchResponse> findAll() {
        return dispatchRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<DispatchResponse> findByStatus(Dispatch.DispatchStatus status) {
        return dispatchRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public DispatchResponse findById(Long id) {
        return toResponse(getDispatch(id));
    }

    @Transactional
    public DispatchResponse create(DispatchRequest request) {
        ReliefHub hub = hubRepository.findById(request.getSourceHubId())
                .orElseThrow(() -> new ResourceNotFoundException("ReliefHub", request.getSourceHubId()));
        Camp camp = campRepository.findById(request.getDestinationCampId())
                .orElseThrow(() -> new ResourceNotFoundException("Camp", request.getDestinationCampId()));
        Campaign campaign = request.getCampaignId() != null ?
                campaignRepository.findById(request.getCampaignId()).orElse(null) : null;
        ResourceRequest resRequest = request.getResourceRequestId() != null ?
                requestRepository.findById(request.getResourceRequestId()).orElse(null) : null;

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User creator = userService.findByUsername(username);

        // Validate stock availability before creating dispatch
        for (DispatchRequest.DispatchItemRequest itemReq : request.getItems()) {
            int available = inventoryService.getAvailableStock(hub.getId(), itemReq.getProductId());
            if (available < itemReq.getQuantity()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));
                throw new BusinessException("Insufficient stock for " + product.getName() +
                        ". Available: " + available + ", Requested: " + itemReq.getQuantity());
            }
        }

        Dispatch dispatch = Dispatch.builder()
                .dispatchNumber(generateDispatchNumber())
                .campaign(campaign)
                .sourceHub(hub)
                .destinationCamp(camp)
                .resourceRequest(resRequest)
                .vehicle(request.getVehicle())
                .driverContact(request.getDriverContact())
                .dispatchDate(request.getDispatchDate() != null ? request.getDispatchDate() : LocalDate.now())
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .priority(request.getPriority() != null ? request.getPriority() : Camp.Priority.MEDIUM)
                .status(Dispatch.DispatchStatus.REQUESTED)
                .notes(request.getNotes())
                .createdBy(creator)
                .build();

        for (DispatchRequest.DispatchItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));
            DispatchItem item = DispatchItem.builder()
                    .dispatch(dispatch).product(product)
                    .quantity(itemReq.getQuantity())
                    .build();
            dispatch.getItems().add(item);
        }

        Dispatch saved = dispatchRepository.save(dispatch);
        auditService.log("CREATE", "Dispatch", saved.getId(), "Created dispatch: " + saved.getDispatchNumber());
        return toResponse(saved);
    }

    @Transactional
    public DispatchResponse approve(Long id) {
        Dispatch dispatch = getDispatch(id);
        if (dispatch.getStatus() != Dispatch.DispatchStatus.REQUESTED)
            throw new BusinessException("Only REQUESTED dispatches can be approved");

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User approver = userService.findByUsername(username);
        dispatch.setApprovedBy(approver);
        dispatch.setStatus(Dispatch.DispatchStatus.APPROVED);

        notificationService.createBroadcastNotification(
                "Dispatch Approved",
                "Dispatch " + dispatch.getDispatchNumber() + " to " + dispatch.getDestinationCamp().getName() + " approved.",
                Notification.NotificationType.DISPATCH_APPROVED, Notification.NotificationSeverity.INFO);
        auditService.log("APPROVE", "Dispatch", id, "Approved dispatch: " + dispatch.getDispatchNumber());
        return toResponse(dispatchRepository.save(dispatch));
    }

    @Transactional
    public DispatchResponse markInTransit(Long id) {
        Dispatch dispatch = getDispatch(id);
        if (dispatch.getStatus() != Dispatch.DispatchStatus.APPROVED &&
                dispatch.getStatus() != Dispatch.DispatchStatus.PREPARING)
            throw new BusinessException("Dispatch must be APPROVED or PREPARING to mark IN_TRANSIT");

        // Deduct stock when dispatched
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByUsername(username);

        for (DispatchItem item : dispatch.getItems()) {
            inventoryService.adjustStock(
                    dispatch.getSourceHub().getId(), item.getProduct().getId(),
                    item.getQuantity(), InventoryTransaction.TransactionType.DISPATCH,
                    "Dispatch: " + dispatch.getDispatchNumber(), user
            );
        }
        dispatch.setStatus(Dispatch.DispatchStatus.IN_TRANSIT);
        return toResponse(dispatchRepository.save(dispatch));
    }

    @Transactional
    public DispatchResponse markDelivered(Long id) {
        Dispatch dispatch = getDispatch(id);
        if (dispatch.getStatus() != Dispatch.DispatchStatus.IN_TRANSIT)
            throw new BusinessException("Dispatch must be IN_TRANSIT to mark DELIVERED");

        dispatch.setStatus(Dispatch.DispatchStatus.DELIVERED);
        dispatch.setActualDeliveryDate(LocalDate.now());
        for (DispatchItem item : dispatch.getItems()) {
            item.setDeliveredQuantity(item.getQuantity());
        }

        // Update linked resource request status
        if (dispatch.getResourceRequest() != null) {
            ResourceRequest req = dispatch.getResourceRequest();
            req.setStatus(ResourceRequest.RequestStatus.DELIVERED);
            requestRepository.save(req);
        }

        notificationService.createBroadcastNotification(
                "Dispatch Delivered",
                "Dispatch " + dispatch.getDispatchNumber() + " delivered to " + dispatch.getDestinationCamp().getName() + ".",
                Notification.NotificationType.DISPATCH_DELIVERED, Notification.NotificationSeverity.INFO);
        auditService.log("DELIVER", "Dispatch", id, "Delivered dispatch: " + dispatch.getDispatchNumber());
        return toResponse(dispatchRepository.save(dispatch));
    }

    public Dispatch getDispatch(Long id) {
        return dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch", id));
    }

    private String generateDispatchNumber() {
        long count = dispatchRepository.count() + 1;
        return "DSP-" + String.format("%06d", count);
    }

    private DispatchResponse toResponse(Dispatch d) {
        List<DispatchResponse.ItemResponse> items = d.getItems().stream()
                .map(i -> DispatchResponse.ItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .quantity(i.getQuantity())
                        .deliveredQuantity(i.getDeliveredQuantity())
                        .build())
                .collect(Collectors.toList());

        return DispatchResponse.builder()
                .id(d.getId())
                .dispatchNumber(d.getDispatchNumber())
                .campaignId(d.getCampaign() != null ? d.getCampaign().getId() : null)
                .campaignName(d.getCampaign() != null ? d.getCampaign().getName() : null)
                .sourceHubId(d.getSourceHub().getId())
                .sourceHubName(d.getSourceHub().getName())
                .destinationCampId(d.getDestinationCamp().getId())
                .destinationCampName(d.getDestinationCamp().getName())
                .resourceRequestId(d.getResourceRequest() != null ? d.getResourceRequest().getId() : null)
                .vehicle(d.getVehicle())
                .driverContact(d.getDriverContact())
                .dispatchDate(d.getDispatchDate())
                .expectedDeliveryDate(d.getExpectedDeliveryDate())
                .actualDeliveryDate(d.getActualDeliveryDate())
                .priority(d.getPriority())
                .status(d.getStatus())
                .notes(d.getNotes())
                .createdByName(d.getCreatedBy() != null ? d.getCreatedBy().getFullName() : null)
                .approvedByName(d.getApprovedBy() != null ? d.getApprovedBy().getFullName() : null)
                .items(items)
                .createdAt(d.getCreatedAt())
                .build();
    }
}
