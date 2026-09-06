package com.example.back.dto;

import java.time.LocalDateTime;

import com.example.back.vo.notification.NotificationVo;

import lombok.Builder;
import lombok.Getter;

// 알림 응답
@Getter
@Builder
public class NotificationResponse {
    private Long id;
    private Long tripId;
    private String type;
    private String title;
    private String body;
    private String actionType;
    private Boolean read;
    private LocalDateTime createdAt;

    public static NotificationResponse from(NotificationVo notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .tripId(notification.getTripId())
                .type(notification.getType().getCode())
                .title(notification.getTitle())
                .body(notification.getBody())
                .actionType(notification.getActionType())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}