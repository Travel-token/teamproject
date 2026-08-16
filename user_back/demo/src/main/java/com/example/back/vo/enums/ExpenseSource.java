package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** expenses.source : manual/ocr/card_sync */
@Getter
@RequiredArgsConstructor
public enum ExpenseSource implements CodeEnum {
    MANUAL("manual"),
    OCR("ocr"),
    CARD_SYNC("card_sync");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<ExpenseSource> {
        public Handler() {
            super(ExpenseSource.class);
        }
    }
}
