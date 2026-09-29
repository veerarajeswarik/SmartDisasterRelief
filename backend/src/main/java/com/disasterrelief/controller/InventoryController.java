package com.disasterrelief.controller;

import com.disasterrelief.dto.response.InventoryResponse;
import com.disasterrelief.entity.InventoryTransaction;
import com.disasterrelief.entity.User;
import com.disasterrelief.service.InventoryService;
import com.disasterrelief.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAll(
            @RequestParam(required = false) Long hubId) {
        if (hubId != null) return ResponseEntity.ok(inventoryService.findByHub(hubId));
        return ResponseEntity.ok(inventoryService.findAll());
    }

    @GetMapping("/critical")
    public ResponseEntity<List<InventoryResponse>> getCriticalStock() {
        return ResponseEntity.ok(inventoryService.findCriticalStock());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStock() {
        return ResponseEntity.ok(inventoryService.findLowStock());
    }

    @PostMapping("/adjust")
    public ResponseEntity<InventoryResponse> adjustStock(@RequestBody StockAdjustmentRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByUsername(username);
        InventoryResponse response = inventoryService.adjustStock(
                request.getHubId(), request.getProductId(), request.getQuantity(),
                request.getTransactionType(), request.getNotes(), user);
        return ResponseEntity.ok(response);
    }

    @Data
    public static class StockAdjustmentRequest {
        private Long hubId;
        private Long productId;
        private int quantity;
        private InventoryTransaction.TransactionType transactionType;
        private String notes;
    }
}
