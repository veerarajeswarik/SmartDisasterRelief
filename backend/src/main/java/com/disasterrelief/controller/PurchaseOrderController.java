package com.disasterrelief.controller;

import com.disasterrelief.dto.request.PurchaseOrderRequest;
import com.disasterrelief.dto.response.PurchaseOrderResponse;
import com.disasterrelief.entity.PurchaseOrder;
import com.disasterrelief.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService poService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponse>> getAll(
            @RequestParam(required = false) PurchaseOrder.POStatus status) {
        if (status != null) return ResponseEntity.ok(poService.findByStatus(status));
        return ResponseEntity.ok(poService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(poService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> create(@Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(poService.create(request));
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<PurchaseOrderResponse> submit(@PathVariable Long id) {
        return ResponseEntity.ok(poService.submitForApproval(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<PurchaseOrderResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(poService.approve(id));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrderResponse> receive(@PathVariable Long id) {
        return ResponseEntity.ok(poService.receive(id));
    }
}
