package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** notifications.type : gps/settle/invite/feed_recommend/system */
@Getter
@RequiredArgsConstructor
public enum NotificationType implements CodeEnum {
    GPS("gps"),
    SETTLE("settle"),
    INVITE("invite"),
    FEED_RECOMMEND("feed_recommend"),
    SYSTEM("system");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<NotificationType> {
        public Handler() {
            super(NotificationType.class);
        }
    }
}
