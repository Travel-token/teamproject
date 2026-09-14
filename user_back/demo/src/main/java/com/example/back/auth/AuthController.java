package com.example.back.auth;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
 private final SessionService sessions;
 public record RefreshRequest(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=512) String refreshToken){}
 @PostMapping("/refresh") public LoginResponseDto refresh(@jakarta.validation.Valid @RequestBody RefreshRequest body){return sessions.refresh(body.refreshToken());}
 @PostMapping("/logout") public void logout(@jakarta.validation.Valid @RequestBody RefreshRequest body){sessions.logout(body.refreshToken());}
}
