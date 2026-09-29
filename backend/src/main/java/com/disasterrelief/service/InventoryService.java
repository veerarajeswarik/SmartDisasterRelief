package com.disasterrelief.service;

import com.disasterrelief.dto.response.InventoryResponse;
import com.disasterrelief.entity.*;
import com.disasterrelief.exception.BusinessException;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final ReliefHubRepository hubRepository;
    private final ProductRepository productRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public List<InventoryResponse> findAll() {
        return inventoryRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InventoryResponse> findByHub(Long hubId) {
        return inventoryRepository.findByHubId(hubId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InventoryResponse> findCriticalStock() {
        return inventoryRepository.findCriticalStockItems().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InventoryResponse> findLowStock() {
        return inventoryRepository.findLowStockItems().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public InventoryResponse adjustStock(Long hubId, Long productId, int quantity,
                                         InventoryTransaction.TransactionType type,
                                         String notes, User performedBy) {
        ReliefHub hub = hubRepository.findById(hubId)
                .orElseThrow(() -> new ResourceNotFoundException("ReliefHub", hubId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        Inventory inventory = inventoryRepository.findByHubIdAndProductId(hubId, productId)
                .orElse(Inventory.builder().hub(hub).product(product)
                        .quantityOnHand(0)
                        .minimumStockLevel(product.getMinimumStockLevel())
                        .maximumStockCapacity(product.getMaximumStockCapacity())
                        .build());

        int before = inventory.getQuantityOnHand();
        int after;

        switch (type) {
            case PURCHASE_RECEIPT, RETURN, INITIAL_STOCK -> after = before + Math.abs(quantity);
            case DISPATCH -> {
                if (before < Math.abs(quantity)) {
                    throw new BusinessException("Insufficient stock. Available: " + before + ", Requested: " + Math.abs(quantity));
                }
                after = before - Math.abs(quantity);
            }
            case ADJUSTMENT -> after = Math.max(0, before + quantity);
            default -> after = before;
        }

        inventory.setQuantityOnHand(after);
        Inventory saved = inventoryRepository.save(inventory);

        InventoryTransaction tx = InventoryTransaction.builder()
                .hub(hub).product(product).transactionType(type)
                .quantity(Math.abs(quantity)).quantityBefore(before).quantityAfter(after)
                .notes(notes).performedBy(performedBy)
                .build();
        transactionRepository.save(tx);

        checkAndNotifyLowStock(saved, product.getName(), hub.getName());
        auditService.log("INVENTORY_ADJUSTMENT", "Inventory", saved.getId(),
                type + " " + Math.abs(quantity) + " of " + product.getName() + " at " + hub.getName());

        return toResponse(saved);
    }

    private void checkAndNotifyLowStock(Inventory inventory, String productName, String hubName) {
        if (inventory.getStockStatus() == Inventory.StockStatus.CRITICAL) {
            notificationService.createBroadcastNotification(
                    "CRITICAL: Low Stock Alert",
                    productName + " at " + hubName + " is critically low (" +
                            String.format("%.1f", inventory.getStockPercentage()) + "%). Immediate replenishment required.",
                    Notification.NotificationType.LOW_STOCK,
                    Notification.NotificationSeverity.CRITICAL
            );
        }
    }

    @Transactional
    public Inventory getOrCreateInventory(Long hubId, Long productId) {
        return inventoryRepository.findByHubIdAndProductId(hubId, productId)
                .orElseGet(() -> {
                    ReliefHub hub = hubRepository.findById(hubId)
                            .orElseThrow(() -> new ResourceNotFoundException("ReliefHub", hubId));
                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
                    return Inventory.builder().hub(hub).product(product)
                            .quantityOnHand(0)
                            .minimumStockLevel(product.getMinimumStockLevel())
                            .maximumStockCapacity(product.getMaximumStockCapacity())
                            .build();
                });
    }

    public int getAvailableStock(Long hubId, Long productId) {
        return inventoryRepository.findByHubIdAndProductId(hubId, productId)
                .map(Inventory::getQuantityOnHand).orElse(0);
    }

    private InventoryResponse toResponse(Inventory i) {
        return InventoryResponse.builder()
                .id(i.getId())
                .hubId(i.getHub().getId())
                .hubName(i.getHub().getName())
                .productId(i.getProduct().getId())
                .productName(i.getProduct().getName())
                .productCode(i.getProduct().getProductCode())
                .productCategory(i.getProduct().getCategory().name())
                .unit(i.getProduct().getUnit())
                .quantityOnHand(i.getQuantityOnHand())
                .minimumStockLevel(i.getMinimumStockLevel())
                .maximumStockCapacity(i.getMaximumStockCapacity())
                .stockStatus(i.getStockStatus())
                .stockPercentage(i.getStockPercentage())
                .lastUpdated(i.getLastUpdated())
                .build();
    }
}
