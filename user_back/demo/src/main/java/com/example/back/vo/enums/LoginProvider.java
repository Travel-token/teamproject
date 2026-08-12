package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** users.login_provider : mock/google/naver/kakao/apple */
@Getter
@RequiredArgsConstructor
public enum LoginProvider implements CodeEnum {
    MOCK("mock"),
    GOOGLE("google"),
    NAVER("naver"),
    KAKAO("kakao"),
    APPLE("apple");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<LoginProvider> {
        public Handler() {
            super(LoginProvider.class);
        }
    }
}
