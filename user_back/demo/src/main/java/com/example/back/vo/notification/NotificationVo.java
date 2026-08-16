package com.example.back.vo.notification;

import com.example.back.vo.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** notifications : 알림 (GPS 방문 감지, 정산 요청/완료, 피드 추천 도착, 초대 등) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationVo {

    private Long id;
    private Long userId;
    private Long tripId;
    private NotificationType type;
    private String title;
    private String body;
    private String actionType;
    private Boolean read;
    private LocalDateTime createdAt;
}
