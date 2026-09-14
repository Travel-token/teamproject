package com.example.back.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDto {
    private Long userId;
    private String name;
    private String sessionId;
    private String accessToken;
    private String refreshToken;
    private long accessExpiresAt;
    private long refreshExpiresAt;
}