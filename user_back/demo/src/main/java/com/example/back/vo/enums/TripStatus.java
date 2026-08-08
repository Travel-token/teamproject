package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** trips.status : planned/ongoing/completed */
@Getter
@RequiredArgsConstructor
public enum TripStatus implements CodeEnum {
    PLANNED("planned"),
    ONGOING("ongoing"),
    COMPLETED("completed");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<TripStatus> {
        public Handler() {
            super(TripStatus.class);
        }
    }
}
