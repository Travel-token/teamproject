package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** places.category : heritage/nature/food/wellness */
@Getter
@RequiredArgsConstructor
public enum PlaceCategory implements CodeEnum {
    HERITAGE("heritage"),
    NATURE("nature"),
    FOOD("food"),
    WELLNESS("wellness");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<PlaceCategory> {
        public Handler() {
            super(PlaceCategory.class);
        }
    }
}
