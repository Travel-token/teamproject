package com.example.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.example.project.dto.auth.LoginRequest;
import com.example.project.dto.auth.LoginResponse;
import com.example.project.mapper.AdminMapper;
import com.example.project.sercurity.AdminPrincipal;
import com.example.project.sercurity.JwtTokenProvider;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final AdminMapper adminMapper;

    public LoginResponse login(LoginRequest request) {
        // AuthenticationManager가 AdminUserDetailsService + PasswordEncoder로 아이디/비밀번호를 검증한다.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        AdminPrincipal principal = (AdminPrincipal) authentication.getPrincipal();
        String token = jwtTokenProvider.createToken(principal.getUsername(), principal.getId(), principal.getName());

        adminMapper.updateLastLoginAt(principal.getId());

        return new LoginResponse(token, "Bearer", principal.getId(), principal.getUsername(), principal.getName());
    }
}
