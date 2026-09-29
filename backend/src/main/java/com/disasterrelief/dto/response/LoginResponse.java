package com.disasterrelief.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class LoginResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String profileImage;
    private String role;
    private Long assignedCampId;
    private String assignedCampName;
}
