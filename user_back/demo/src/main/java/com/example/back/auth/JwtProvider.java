package com.example.back.auth;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtProvider {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expiration-time}")
    private long expirationTime;

    // 토큰 생성
    public String generateToken(Long userId, String email) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        Date now = new Date();

        Date expireDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(now)
                .expiration(expireDate)
                .signWith(key)
                .compact();
    }

    // 토큰 검증
    public boolean validateToken(String token) {

        try {

            getClaims(token);
            return true;

        } catch (Exception e) {
            log.error("토큰 검증 실패: {}", e.getMessage());
            return false;

        }

    }

    // Clamis 추출
    public Claims getClaims(String token) {

        SecretKey key = Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8));

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

    }

    // userid 추출
    public Long getUserId(String token) {

        return Long.valueOf(
                getClaims(token).getSubject());
    }

    // email 추출
    public String getEmail(String token) {

        return getClaims(token).get("email", String.class);
    }

}
