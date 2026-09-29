package com.disasterrelief.controller;

import com.disasterrelief.entity.User;
import com.disasterrelief.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.disasterrelief.entity.Camp;
import com.disasterrelief.entity.Role;
import com.disasterrelief.repository.CampRepository;
import com.disasterrelief.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final CampRepository campRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(userService.findAll().stream().map(this::toMap).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody CreateUserRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));

        Camp camp = req.getAssignedCampId() != null ?
                campRepository.findById(req.getAssignedCampId()).orElse(null) : null;

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .role(Role.valueOf(req.getRole()))
                .phone(req.getPhone())
                .assignedCamp(camp)
                .active(true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(userRepository.save(user)));
    }

    private Map<String, Object> toMap(User u) {
        return Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "fullName", u.getFullName(),
                "email", u.getEmail(),
                "role", u.getRole().name(),
                "active", u.isActive(),
                "assignedCamp", u.getAssignedCamp() != null ? u.getAssignedCamp().getName() : ""
        );
    }

    @Data
    public static class CreateUserRequest {
        private String username;
        private String password;
        private String fullName;
        private String email;
        private String role;
        private String phone;
        private Long assignedCampId;
    }
}
