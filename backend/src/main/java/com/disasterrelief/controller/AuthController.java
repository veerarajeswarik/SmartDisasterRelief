package com.disasterrelief.controller;

import com.disasterrelief.dto.request.LoginRequest;
import com.disasterrelief.dto.response.LoginResponse;
import com.disasterrelief.service.AuthService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.disasterrelief.security.JwtUtils;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;

    /** Existing password-based login (demo accounts) */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** Google Sign-In — receives the Google ID token from the frontend */
    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(@RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.googleLogin(request.getIdToken()));
    }

    /** Return current authenticated user's profile */
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        // UserDetails.username is email for Google users, username for password users
        // We look up by email stored in JWT claims via the request header
        // Use the email claim from the JWT (carried in UserDetails name for Google users)
        return ResponseEntity.ok(authService.getMe(userDetails.getUsername()));
    }

    @Data
    public static class GoogleLoginRequest {
        private String idToken;
    }
}
