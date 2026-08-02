package com.example.project.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.project.common.ApiResponse;
import com.example.project.dto.auth.AdminMeResponse;
import com.example.project.dto.auth.LoginRequest;
import com.example.project.dto.auth.LoginResponse;
import com.example.project.sercurity.AdminPrincipal;
import com.example.project.service.AuthService;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** 관리자 로그인 - 성공 시 JWT 발급 */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("로그인되었습니다.", authService.login(request));
    }

    /**
     * 로그아웃: JWT는 서버에 상태를 저장하지 않으므로(stateless)
     * 클라이언트에서 토큰을 폐기하는 것으로 처리한다. 엔드포인트는 호환성을 위해 유지.
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.ok("로그아웃되었습니다.", null);
    }

    /** 현재 로그인한 관리자 정보 조회 (토큰 유효성 확인용) */
    @GetMapping("/me")
    public ApiResponse<AdminMeResponse> me(@AuthenticationPrincipal AdminPrincipal principal) {
        return ApiResponse.ok(new AdminMeResponse(principal.getId(), principal.getUsername(), principal.getName()));
    }
}
