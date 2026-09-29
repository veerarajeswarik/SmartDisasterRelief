package com.disasterrelief.service;

import com.disasterrelief.dto.request.PurchaseOrderRequest;
import com.disasterrelief.dto.response.PurchaseOrderResponse;
import com.disasterrelief.entity.*;
import com.disasterrelief.exception.BusinessException;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final SupplierRepository supplierRepository;
    private final ReliefHubRepository hubRepository;
    private final CampaignRepository campaignRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final InventoryService inventoryService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public List<PurchaseOrderResponse> findAll() {
        return poRepository.findAllOrderByCreatedAtDesc().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PurchaseOrderResponse> findByStatus(PurchaseOrder.POStatus status) {
        return poRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PurchaseOrderResponse findById(Long id) {
        return toResponse(getPO(id));
    }

    @Transactional
    public PurchaseOrderResponse create(PurchaseOrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.getSupplierId()));
        ReliefHub hub = hubRepository.findById(request.getHubId())
                .orElseThrow(() -> new ResourceNotFoundException("ReliefHub", request.getHubId()));
        Campaign campaign = request.getCampaignId() != null ?
                campaignRepository.findById(request.getCampaignId()).orElse(null) : null;

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User creator = userService.findByUsername(username);

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(generatePONumber())
                .supplier(supplier).hub(hub).campaign(campaign)
                .orderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDate.now())
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .notes(request.getNotes())
                .status(PurchaseOrder.POStatus.DRAFT)
                .createdBy(creator)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseOrderRequest.PurchaseOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));
            BigDecimal itemTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(itemTotal);
            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(po).product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .totalPrice(itemTotal)
                    .receivedQuantity(0)
                    .build();
            po.getItems().add(item);
        }
        po.setTotalAmount(total);
        PurchaseOrder saved = poRepository.save(po);
        auditService.log("CREATE", "PurchaseOrder", saved.getId(), "Created PO: " + saved.getPoNumber());
        return toResponse(saved);
    }

    @Transactional
    public PurchaseOrderResponse submitForApproval(Long id) {
        PurchaseOrder po = getPO(id);
        if (po.getStatus() != PurchaseOrder.POStatus.DRAFT)
            throw new BusinessException("Only DRAFT purchase orders can be submitted for approval");
        po.setStatus(PurchaseOrder.POStatus.PENDING_APPROVAL);
        notificationService.createBroadcastNotification(
                "Purchase Order Awaiting Approval",
                "PO " + po.getPoNumber() + " from " + po.getSupplier().getName() + " is awaiting approval.",
                Notification.NotificationType.PO_APPROVAL, Notification.NotificationSeverity.INFO);
        return toResponse(poRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponse approve(Long id) {
        PurchaseOrder po = getPO(id);
        if (po.getStatus() != PurchaseOrder.POStatus.PENDING_APPROVAL)
            throw new BusinessException("Only PENDING_APPROVAL purchase orders can be approved");
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User approver = userService.findByUsername(username);
        po.setStatus(PurchaseOrder.POStatus.APPROVED);
        po.setApprovedBy(approver);
        po.setApprovedAt(LocalDateTime.now());
        auditService.log("PO_APPROVED", "PurchaseOrder", id, "Approved PO: " + po.getPoNumber());
        return toResponse(poRepository.save(po));
    }

    @Transactional
    public PurchaseOrderResponse receive(Long id) {
        PurchaseOrder po = getPO(id);
        if (po.getStatus() != PurchaseOrder.POStatus.APPROVED)
            throw new BusinessException("Only APPROVED purchase orders can be received");

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User receiver = userService.findByUsername(username);

        for (PurchaseOrderItem item : po.getItems()) {
            inventoryService.adjustStock(
                    po.getHub().getId(), item.getProduct().getId(),
                    item.getQuantity(), InventoryTransaction.TransactionType.PURCHASE_RECEIPT,
                    "PO Receipt: " + po.getPoNumber(), receiver
            );
            item.setReceivedQuantity(item.getQuantity());
        }
        po.setStatus(PurchaseOrder.POStatus.RECEIVED);
        po.setReceivedAt(LocalDateTime.now());

        notificationService.createBroadcastNotification(
                "Inventory Received",
                "PO " + po.getPoNumber() + " has been received. Inventory updated at " + po.getHub().getName() + ".",
                Notification.NotificationType.INVENTORY_RECEIVED, Notification.NotificationSeverity.INFO);
        auditService.log("PO_RECEIVED", "PurchaseOrder", id, "Received PO: " + po.getPoNumber());
        return toResponse(poRepository.save(po));
    }

    public PurchaseOrder getPO(Long id) {
        return poRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));
    }

    private String generatePONumber() {
        long count = poRepository.count() + 1;
        return "PO-" + String.format("%06d", count);
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder po) {
        List<PurchaseOrderResponse.ItemResponse> items = po.getItems().stream()
                .map(i -> PurchaseOrderResponse.ItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .productCode(i.getProduct().getProductCode())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getTotalPrice())
                        .receivedQuantity(i.getReceivedQuantity())
                        .build())
                .collect(Collectors.toList());

        return PurchaseOrderResponse.builder()
                .id(po.getId())
                .poNumber(po.getPoNumber())
                .supplierId(po.getSupplier().getId())
                .supplierName(po.getSupplier().getName())
                .hubId(po.getHub().getId())
                .hubName(po.getHub().getName())
                .campaignId(po.getCampaign() != null ? po.getCampaign().getId() : null)
                .campaignName(po.getCampaign() != null ? po.getCampaign().getName() : null)
                .orderDate(po.getOrderDate())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .totalAmount(po.getTotalAmount())
                .status(po.getStatus())
                .notes(po.getNotes())
                .createdByName(po.getCreatedBy() != null ? po.getCreatedBy().getFullName() : null)
                .approvedByName(po.getApprovedBy() != null ? po.getApprovedBy().getFullName() : null)
                .approvedAt(po.getApprovedAt())
                .receivedAt(po.getReceivedAt())
                .items(items)
                .createdAt(po.getCreatedAt())
                .build();
    }
}
