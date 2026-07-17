package com.example.project.dto.user;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 회원 상세 조회 시 users 테이블에서 바로 뽑히는 기본 정보 (MyBatis 자동 매핑용) */
@Getter
@Setter
@NoArgsConstructor
public class UserBasicRow {
    private Long id;
    private String name;
    private String email;
    private String provider;
    private String joinedAt;
    private String status;
}
