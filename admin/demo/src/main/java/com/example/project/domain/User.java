package com.example.project.domain;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** users 테이블 매핑 */
@Getter
@Setter
public class User {
    private Long id;
    private String name;
    private String email;
    private String loginProvider;  // google/kakao/naver/apple
    private String profileEmoji;
    private String status;         // active/blocked/withdrawn
    private LocalDateTime createdAt;
}
