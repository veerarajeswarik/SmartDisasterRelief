package com.disasterrelief.controller;

import com.disasterrelief.dto.request.ResourceRequestDto;
import com.disasterrelief.dto.response.ResourceRequestResponse;
import com.disasterrelief.entity.ResourceRequest;
import com.disasterrelief.service.ResourceRequestService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resource-requests")
@RequiredArgsConstructor
public class ResourceRequestController {

    private final ResourceRequestService requestService;

    @GetMapping
    public ResponseEntity<List<ResourceRequestResponse>> getAll(
            @RequestParam(required = false) ResourceRequest.RequestStatus status,
            @RequestParam(required = false) Long campId) {
        if (campId != null) return ResponseEntity.ok(requestService.findByCamp(campId));
        if (status != null) return ResponseEntity.ok(requestService.findByStatus(status));
        return ResponseEntity.ok(requestService.findAll());
    }

    @GetMapping("/sos")
    public ResponseEntity<List<ResourceRequestResponse>> getSos() {
        return ResponseEntity.ok(requestService.findSos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceRequestResponse> create(@Valid @RequestBody ResourceRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.create(dto));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ResourceRequestResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.approve(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ResourceRequestResponse> reject(@PathVariable Long id,
                                                           @RequestBody RejectRequest req) {
        return ResponseEntity.ok(requestService.reject(id, req.getReason()));
    }

    @Data
    public static class RejectRequest {
        private String reason;
    }
}
