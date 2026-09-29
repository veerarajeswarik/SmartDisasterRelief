package com.disasterrelief.controller;

import com.disasterrelief.dto.request.FundAccountRequest;
import com.disasterrelief.dto.response.FundAccountResponse;
import com.disasterrelief.service.FundAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fund-accounts")
@RequiredArgsConstructor
public class FundAccountController {

    private final FundAccountService fundAccountService;

    @GetMapping
    public ResponseEntity<List<FundAccountResponse>> getAll() {
        return ResponseEntity.ok(fundAccountService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FundAccountResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(fundAccountService.findById(id));
    }

    @PostMapping
    public ResponseEntity<FundAccountResponse> create(@Valid @RequestBody FundAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fundAccountService.create(request));
    }
}
