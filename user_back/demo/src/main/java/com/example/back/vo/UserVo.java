package com.example.back.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserVo {

    private Long id;
    private String name;
    private String email;
    private String loginProvider;  // google/kakao/naver/apple
    private String profileEmoji;
    private String status;         // active/blocked/withdrawn
    private LocalDateTime createdAt;

}
