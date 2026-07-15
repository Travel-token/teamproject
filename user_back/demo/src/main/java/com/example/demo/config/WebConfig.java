package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// ============================================================
// WebConfig : CORS(교차 출처) 통행 허가증
// - 브라우저는 보안상 "다른 주소에서 온 요청"을 기본으로 막습니다.
//   Expo 웹(localhost:8081)에서 서버(localhost:8080)를 부르면
//   주소가 달라서 차단당해요. 그걸 허가해 주는 설정입니다.
// - 폰/에뮬레이터 앱은 이 규칙과 무관하지만,
//   웹으로 테스트할 때를 위해 넣어 둡니다.
// - 주의: 지금은 개발 편의를 위해 전부 허용(*)이고,
//   실제 서비스 배포 전에는 우리 앱 주소만 허용하도록 좁혀야 합니다.
// ============================================================
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")          // /api로 시작하는 모든 주소에
                .allowedOrigins("*")            // 어디서 온 요청이든 (개발용)
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS");
    }
}
