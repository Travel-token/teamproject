package com.example.back.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class DevLoginController {
    
    
    private final AuthService authService;


    @PostMapping("/dev-login")
    public LoginResponseDto devLogin(@RequestBody DevLoginRequestDto request) {

        return authService.devLogin(request);

    }
}
