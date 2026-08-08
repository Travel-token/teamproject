package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** feed_recommendations.status : pending/adopted/edited/dismissed */
@Getter
@RequiredArgsConstructor
public enum RecommendationStatus implements CodeEnum {
    PENDING("pending"),
    ADOPTED("adopted"),
    EDITED("edited"),
    DISMISSED("dismissed");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<RecommendationStatus> {
        public Handler() {
            super(RecommendationStatus.class);
        }
    }
}
