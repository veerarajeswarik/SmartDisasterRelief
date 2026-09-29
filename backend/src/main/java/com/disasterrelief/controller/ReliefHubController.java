package com.disasterrelief.controller;

import com.disasterrelief.dto.request.ReliefHubRequest;
import com.disasterrelief.dto.response.ReliefHubResponse;
import com.disasterrelief.service.ReliefHubService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hubs")
@RequiredArgsConstructor
public class ReliefHubController {

    private final ReliefHubService hubService;

    @GetMapping
    public ResponseEntity<List<ReliefHubResponse>> getAll() {
        return ResponseEntity.ok(hubService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReliefHubResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hubService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ReliefHubResponse> create(@Valid @RequestBody ReliefHubRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hubService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReliefHubResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody ReliefHubRequest request) {
        return ResponseEntity.ok(hubService.update(id, request));
    }
}
