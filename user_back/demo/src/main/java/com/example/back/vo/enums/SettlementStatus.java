package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** settlements.status : in_progress/completed */
@Getter
@RequiredArgsConstructor
public enum SettlementStatus implements CodeEnum {
    IN_PROGRESS("in_progress"),
    COMPLETED("completed");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<SettlementStatus> {
        public Handler() {
            super(SettlementStatus.class);
        }
    }
}
