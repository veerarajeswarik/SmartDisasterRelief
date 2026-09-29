package com.disasterrelief.service;

import com.disasterrelief.dto.request.ReliefHubRequest;
import com.disasterrelief.dto.response.ReliefHubResponse;
import com.disasterrelief.entity.Inventory;
import com.disasterrelief.entity.ReliefHub;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.InventoryRepository;
import com.disasterrelief.repository.ReliefHubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReliefHubService {

    private final ReliefHubRepository reliefHubRepository;
    private final InventoryRepository inventoryRepository;
    private final AuditService auditService;

    public List<ReliefHubResponse> findAll() {
        return reliefHubRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ReliefHubResponse findById(Long id) {
        return toResponse(getHub(id));
    }

    @Transactional
    public ReliefHubResponse create(ReliefHubRequest request) {
        ReliefHub hub = ReliefHub.builder()
                .hubCode(generateCode())
                .name(request.getName())
                .location(request.getLocation())
                .address(request.getAddress())
                .contactPerson(request.getContactPerson())
                .contactNumber(request.getContactNumber())
                .storageCapacity(request.getStorageCapacity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(request.getStatus() != null ? request.getStatus() : ReliefHub.HubStatus.ACTIVE)
                .build();
        ReliefHub saved = reliefHubRepository.save(hub);
        auditService.log("CREATE", "ReliefHub", saved.getId(), "Created hub: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public ReliefHubResponse update(Long id, ReliefHubRequest request) {
        ReliefHub hub = getHub(id);
        hub.setName(request.getName());
        hub.setLocation(request.getLocation());
        hub.setAddress(request.getAddress());
        hub.setContactPerson(request.getContactPerson());
        hub.setContactNumber(request.getContactNumber());
        hub.setStorageCapacity(request.getStorageCapacity());
        hub.setLatitude(request.getLatitude());
        hub.setLongitude(request.getLongitude());
        if (request.getStatus() != null) hub.setStatus(request.getStatus());
        auditService.log("UPDATE", "ReliefHub", id, "Updated hub: " + hub.getName());
        return toResponse(reliefHubRepository.save(hub));
    }

    public ReliefHub getHub(Long id) {
        return reliefHubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReliefHub", id));
    }

    private String generateCode() {
        long count = reliefHubRepository.count() + 1;
        return "HUB-" + String.format("%04d", count);
    }

    private ReliefHubResponse toResponse(ReliefHub h) {
        List<Inventory> inventories = inventoryRepository.findByHubId(h.getId());
        int totalStock = inventories.stream().mapToInt(Inventory::getQuantityOnHand).sum();
        return ReliefHubResponse.builder()
                .id(h.getId())
                .hubCode(h.getHubCode())
                .name(h.getName())
                .location(h.getLocation())
                .address(h.getAddress())
                .contactPerson(h.getContactPerson())
                .contactNumber(h.getContactNumber())
                .storageCapacity(h.getStorageCapacity())
                .latitude(h.getLatitude())
                .longitude(h.getLongitude())
                .status(h.getStatus())
                .inventoryItemCount(inventories.size())
                .totalStockQuantity(totalStock)
                .createdAt(h.getCreatedAt())
                .build();
    }
}
