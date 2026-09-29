package com.disasterrelief.controller;

import com.disasterrelief.dto.request.JournalEntryRequest;
import com.disasterrelief.dto.response.JournalEntryResponse;
import com.disasterrelief.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journal")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @GetMapping
    public ResponseEntity<List<JournalEntryResponse>> getAll() {
        return ResponseEntity.ok(journalService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalEntryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(journalService.findById(id));
    }

    @PostMapping
    public ResponseEntity<JournalEntryResponse> create(@Valid @RequestBody JournalEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(journalService.create(request));
    }
}
