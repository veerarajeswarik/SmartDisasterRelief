package com.disasterrelief.service;

import com.disasterrelief.dto.request.LoginRequest;
import com.disasterrelief.dto.response.LoginResponse;
import com.disasterrelief.entity.Role;
import com.disasterrelief.entity.User;
import com.disasterrelief.exception.BusinessException;
import com.disasterrelief.repository.UserRepository;
import com.disasterrelief.security.JwtUtils;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final GoogleTokenVerifier googleTokenVerifier;

    @Value("${app.admin.email:admin@example.com}")
    private String adminEmail;

    // ─── Password Login (existing demo accounts) ───────────────────────────────
    @Transactional
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername(), user.getEmail(), user.getRole().name());
        auditService.log("LOGIN", "User", user.getId(), "Password login: " + user.getUsername());
        return buildResponse(token, user);
    }

    // ─── Google Sign-In ─────────────────────────────────────────────────────────
    @Transactional
    public LoginResponse googleLogin(String idTokenString) {
        // 1. Verify Google token
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(idTokenString);
        if (payload == null) {
            throw new BusinessException("Invalid Google ID token. Please try again.");
        }

        String googleId   = payload.getSubject();
        String email      = payload.getEmail();
        String name       = (String) payload.get("name");
        String picture    = (String) payload.get("picture");

        // 2. Try to find existing user by googleId or email
        Optional<User> existingOpt = userRepository.findByGoogleId(googleId);
        if (existingOpt.isEmpty()) {
            existingOpt = userRepository.findByEmail(email);
        }

        User user;

        if (existingOpt.isPresent()) {
            // 3a. User exists — update Google fields and last login
            user = existingOpt.get();
            if (!user.isActive()) {
                throw new BusinessException("ACCOUNT_DEACTIVATED: Your account has been deactivated. Please contact the administrator.");
            }
            user.setGoogleId(googleId);
            user.setProfileImage(picture);
            if (user.getFullName() == null || user.getFullName().isEmpty()) {
                user.setFullName(name);
            }
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        } else {
            // 3b. No matching user — check if it's the configured bootstrap admin email
            if (email.equalsIgnoreCase(adminEmail)) {
                // Auto-create the first admin account
                user = User.builder()
                        .googleId(googleId)
                        .email(email)
                        .fullName(name != null ? name : email)
                        .profileImage(picture)
                        .role(Role.ADMIN)
                        .active(true)
                        .lastLoginAt(LocalDateTime.now())
                        .build();
                userRepository.save(user);
                auditService.log("USER_CREATED", "User", user.getId(),
                        "Auto-created ADMIN via bootstrap email: " + email);
            } else {
                // 3c. Unknown Google account — reject with specific error code
                throw new BusinessException("ACCOUNT_NOT_REGISTERED: Your Google account (" + email +
                        ") is not registered in SmartRelief. Please contact the system administrator.");
            }
        }

        String token = jwtUtils.generateToken(
                user.getUsername() != null ? user.getUsername() : user.getEmail(),
                user.getEmail(),
                user.getRole().name()
        );
        auditService.log("LOGIN", "User", user.getId(), "Google login: " + email);
        return buildResponse(token, user);
    }

    // ─── /me endpoint helper ────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public LoginResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));
        if (!user.isActive()) {
            throw new BusinessException("ACCOUNT_DEACTIVATED: Your account has been deactivated.");
        }
        String token = jwtUtils.generateToken(
                user.getUsername() != null ? user.getUsername() : user.getEmail(),
                user.getEmail(),
                user.getRole().name()
        );
        return buildResponse(token, user);
    }

    // ─── Shared response builder ─────────────────────────────────────────────
    private LoginResponse buildResponse(String token, User user) {
        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername() != null ? user.getUsername() : user.getEmail())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .role(user.getRole().name())
                .assignedCampId(user.getAssignedCamp() != null ? user.getAssignedCamp().getId() : null)
                .assignedCampName(user.getAssignedCamp() != null ? user.getAssignedCamp().getName() : null)
                .build();
    }
}
