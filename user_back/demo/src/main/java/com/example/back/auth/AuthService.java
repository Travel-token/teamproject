package com.example.back.auth;

public interface AuthService {
    
    LoginResponseDto login(
            String email, 
            LoginProvider loginType);



    LoginResponseDto devLogin(
        DevLoginRequestDto request
    );





}
