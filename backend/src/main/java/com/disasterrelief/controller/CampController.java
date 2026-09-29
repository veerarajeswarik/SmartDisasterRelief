package com.disasterrelief.controller;

import com.disasterrelief.dto.request.CampRequest;
import com.disasterrelief.dto.response.CampResponse;
import com.disasterrelief.service.CampService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/camps")
@RequiredArgsConstructor
public class CampController {

    private final CampService campService;

    @GetMapping
    public ResponseEntity<List<CampResponse>> getAll(
            @RequestParam(required = false) Long campaignId) {
        if (campaignId != null) return ResponseEntity.ok(campService.findByCampaign(campaignId));
        return ResponseEntity.ok(campService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(campService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CampResponse> create(@Valid @RequestBody CampRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody CampRequest request) {
        return ResponseEntity.ok(campService.update(id, request));
    }
}
