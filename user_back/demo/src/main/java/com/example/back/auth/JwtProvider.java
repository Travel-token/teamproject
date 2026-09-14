package com.example.back.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtProvider {
    private final SecretKey key;

    public JwtProvider(@Value("${jwt.secret-key}") String secret) {
        key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long uid, String email, String sid, long expiresAt) {
        return Jwts.builder().subject(uid.toString()).claim("email", email).claim("sid", sid)
                .issuedAt(new Date()).expiration(new Date(expiresAt)).signWith(key).compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getUserId(String token) {
        return Long.valueOf(getClaims(token).getSubject());
    }

    public String getEmail(String token) {
        return getClaims(token).get("email", String.class);
    }
}