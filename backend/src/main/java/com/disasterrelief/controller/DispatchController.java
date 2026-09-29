package com.disasterrelief.controller;

import com.disasterrelief.dto.request.DispatchRequest;
import com.disasterrelief.dto.response.DispatchResponse;
import com.disasterrelief.entity.Dispatch;
import com.disasterrelief.service.DispatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dispatches")
@RequiredArgsConstructor
public class DispatchController {

    private final DispatchService dispatchService;

    @GetMapping
    public ResponseEntity<List<DispatchResponse>> getAll(
            @RequestParam(required = false) Dispatch.DispatchStatus status) {
        if (status != null) return ResponseEntity.ok(dispatchService.findByStatus(status));
        return ResponseEntity.ok(dispatchService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DispatchResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(dispatchService.findById(id));
    }

    @PostMapping
    public ResponseEntity<DispatchResponse> create(@Valid @RequestBody DispatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dispatchService.create(request));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<DispatchResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(dispatchService.approve(id));
    }

    @PutMapping("/{id}/transit")
    public ResponseEntity<DispatchResponse> markInTransit(@PathVariable Long id) {
        return ResponseEntity.ok(dispatchService.markInTransit(id));
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<DispatchResponse> deliver(@PathVariable Long id) {
        return ResponseEntity.ok(dispatchService.markDelivered(id));
    }
}
