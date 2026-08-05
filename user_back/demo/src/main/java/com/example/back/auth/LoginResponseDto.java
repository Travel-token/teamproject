package com.example.back.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDto {
    
    private Long userId;
    private String name;
    private String accessToken;
}
