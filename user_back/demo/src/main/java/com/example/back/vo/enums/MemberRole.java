package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** trip_members.role : owner/member */
@Getter
@RequiredArgsConstructor
public enum MemberRole implements CodeEnum {
    OWNER("owner"),
    MEMBER("member");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<MemberRole> {
        public Handler() {
            super(MemberRole.class);
        }
    }
}
