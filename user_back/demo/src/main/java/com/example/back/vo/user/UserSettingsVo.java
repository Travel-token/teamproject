package com.example.back.vo.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** user_settings : 알림/기능 설정 (PK = user_id) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsVo {

    private Long userId;
    private Boolean notifEnabled;
    private Boolean gpsEnabled;
    private Boolean inviteNotifEnabled;
    private Boolean marketingEnabled;
    private Boolean paySyncEnabled;
    private LocalDateTime updatedAt;
}
