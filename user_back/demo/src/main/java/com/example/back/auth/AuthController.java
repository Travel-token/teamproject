package com.example.back.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/google")
    public String googleLogin() {

        return "나중에 구글";

    }

    @PostMapping("/kakao")
    public String kakaoLogin() {

        return "나중에 카카오";

    }

    @PostMapping("/naver")
    public String naverLogin() {

        return "나중에 네이버";

    }

    @PostMapping("/logout")
    public void logout() {
        // JWT는 서버에 세션을 두지 않으므로 별도 무효화 없이 200만 내려주면
        // 프론트에서 로컬에 저장된 accessToken을 지우는 것으로 로그아웃이 끝난다.
        // 추후 리프레시 토큰/블랙리스트를 도입하면 여기서 무효화 처리를 추가한다.
    }

}
