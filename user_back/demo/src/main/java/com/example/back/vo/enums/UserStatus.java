package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** users.status : active/withdrawn */
@Getter
@RequiredArgsConstructor
public enum UserStatus implements CodeEnum {
    ACTIVE("active"),
    WITHDRAWN("withdrawn");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<UserStatus> {
        public Handler() {
            super(UserStatus.class);
        }
    }
}
