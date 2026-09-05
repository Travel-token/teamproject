package com.example.back.auth;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CORS / 업로드 이미지 주소
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @org.springframework.beans.factory.annotation.Autowired
    private TripAccessInterceptor tripAccessInterceptor;
    @Override public void addInterceptors(org.springframework.web.servlet.config.annotation.InterceptorRegistry registry) {
        registry.addInterceptor(tripAccessInterceptor);
    }


    @Value("${app.upload-dir}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:8081",
                        "http://localhost:8082")
                .allowedMethods(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadLocation = Path.of(uploadDir)
                .toAbsolutePath()
                .toUri()
                .toString();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation);
    }
}