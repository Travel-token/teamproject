package com.example.back.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    

    private final AuthService authService;
    
    @PostMapping("/google")
    public String googleLogin(){

        return "나중에 구글";

    }


    @PostMapping("/kakao")
    public String kakaoLogin(){

        return "나중에 카카오";

    }


    @PostMapping("/naver")
    public String naverLogin(){

        return "나중에 네이버";

    }
}
