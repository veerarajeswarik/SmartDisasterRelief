package com.disasterrelief.service;

import com.disasterrelief.dto.request.SupplierRequest;
import com.disasterrelief.dto.response.SupplierResponse;
import com.disasterrelief.entity.Supplier;
import com.disasterrelief.exception.ResourceNotFoundException;
import com.disasterrelief.repository.PurchaseOrderRepository;
import com.disasterrelief.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final AuditService auditService;

    public List<SupplierResponse> findAll() {
        return supplierRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SupplierResponse findById(Long id) {
        return toResponse(getSupplier(id));
    }

    @Transactional
    public SupplierResponse create(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .supplierCode(generateCode())
                .name(request.getName())
                .contactPerson(request.getContactPerson())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .suppliedCategories(request.getSuppliedCategories())
                .paymentTerms(request.getPaymentTerms())
                .active(request.isActive())
                .build();
        Supplier saved = supplierRepository.save(supplier);
        auditService.log("CREATE", "Supplier", saved.getId(), "Created supplier: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = getSupplier(id);
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setSuppliedCategories(request.getSuppliedCategories());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setActive(request.isActive());
        return toResponse(supplierRepository.save(supplier));
    }

    public Supplier getSupplier(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    private String generateCode() {
        long count = supplierRepository.count() + 1;
        return "SUP-" + String.format("%04d", count);
    }

    private SupplierResponse toResponse(Supplier s) {
        int totalOrders = purchaseOrderRepository.findBySupplierId(s.getId()).size();
        return SupplierResponse.builder()
                .id(s.getId())
                .supplierCode(s.getSupplierCode())
                .name(s.getName())
                .contactPerson(s.getContactPerson())
                .phone(s.getPhone())
                .email(s.getEmail())
                .address(s.getAddress())
                .suppliedCategories(s.getSuppliedCategories())
                .paymentTerms(s.getPaymentTerms())
                .active(s.isActive())
                .totalOrders(totalOrders)
                .createdAt(s.getCreatedAt())
                .build();
    }
}
