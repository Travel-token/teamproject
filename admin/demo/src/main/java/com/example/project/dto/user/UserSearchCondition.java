package com.example.project.dto.user;

import com.example.project.common.PageQuery;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSearchCondition extends PageQuery {
    private String keyword;   // 닉네임/이메일 검색어
    private String status;    // all / active / blocked
    private String provider;  // all / google / kakao / naver / apple
}
