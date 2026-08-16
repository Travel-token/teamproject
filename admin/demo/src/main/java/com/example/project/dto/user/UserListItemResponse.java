package com.example.project.dto.user;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** MyBatis가 SELECT 결과를 setter로 자동 매핑하는 목록용 DTO */
@Getter
@Setter
@NoArgsConstructor
public class UserListItemResponse {
    private Long id;
    private String name;
    private String email;
    private String provider;     // login_provider
    private String joinedAt;     // yyyy.MM.dd
    private int tripCount;
    private String status;       // active / blocked
}
