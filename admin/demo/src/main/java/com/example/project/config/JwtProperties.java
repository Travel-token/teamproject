package com.example.project.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {
    /** application.yml: app.jwt.secret (Base64) */
    private String secret;
    /** application.yml: app.jwt.expiration-ms */
    private long expirationMs;
}
