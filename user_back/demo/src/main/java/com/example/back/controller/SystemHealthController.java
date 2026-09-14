package com.example.back.controller;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
public class SystemHealthController {
    private final JdbcTemplate db;
    private final RestClient recommendation;
    private final RestClient plain = RestClient.builder().build();

    @Value("${integrations.ocr.url:http://127.0.0.1:8001/ocr}")
    private String ocrUrl;
    @Value("${integrations.ocr.api-key:}")
    private String ocrKey;

    public SystemHealthController(JdbcTemplate db,
            @Qualifier("recommendationRestClient") RestClient recommendation) {
        this.db = db;
        this.recommendation = recommendation;
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, String> services = new LinkedHashMap<>();
        services.put("database", checkDatabase());
        services.put("recommendation", checkRecommendation());
        services.put("ocr", checkOcr());
        boolean ready = services.values().stream().allMatch("up"::equals);
        return Map.of("status", ready ? "up" : "degraded", "services", services);
    }

    private String checkDatabase() {
        try { return db.queryForObject("SELECT 1", Integer.class) == 1 ? "up" : "down"; }
        catch (Exception ignored) { return "down"; }
    }

    private String checkRecommendation() {
        try { recommendation.get().uri("/health").retrieve().toBodilessEntity(); return "up"; }
        catch (Exception ignored) { return "down"; }
    }

    private String checkOcr() {
        try {
            String healthUrl = ocrUrl.replaceFirst("/ocr/?$", "/health");
            var request = plain.get().uri(healthUrl);
            if (!ocrKey.isBlank()) request.header(HttpHeaders.AUTHORIZATION, "Bearer " + ocrKey);
            request.retrieve().toBodilessEntity();
            return "up";
        } catch (Exception ignored) { return "down"; }
    }
}
