package com.example.back.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * PATCH /users/me/notifications 요청 바디.
 * 프론트에서 { key: value } 형태로 한 번에 하나씩 보내므로
 * 그 외 필드는 null로 들어온다. null이 아닌 필드만 반영한다.
 */
@Getter
@NoArgsConstructor
public class NotificationUpdateRequest {
    private Boolean notifSettle;
    private Boolean notifInvite;
    private Boolean notifGps;
    private Boolean notifMarketing;
    private Boolean paySync;
    private Boolean darkMode;
}
