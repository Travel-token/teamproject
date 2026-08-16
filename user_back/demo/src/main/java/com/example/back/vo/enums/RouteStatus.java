package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** settlement_routes.status : requested/completed */
@Getter
@RequiredArgsConstructor
public enum RouteStatus implements CodeEnum {
    REQUESTED("requested"),
    COMPLETED("completed");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<RouteStatus> {
        public Handler() {
            super(RouteStatus.class);
        }
    }
}
