package com.example.project.domain;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** admins 테이블 매핑 */
@Getter
@Setter
public class Admin {
    private Long id;
    private String username;
    private String password;   // BCrypt 해시
    private String name;
    private String email;
    private String status;     // active / disabled
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
