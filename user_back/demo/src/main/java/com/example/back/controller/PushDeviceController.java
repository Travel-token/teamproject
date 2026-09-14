package com.example.back.controller;

import com.example.back.util.SecurityUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "integrations.push.enabled", havingValue = "true")
@RequestMapping("/api/push-devices")
@RequiredArgsConstructor
public class PushDeviceController {
    private final JdbcTemplate db;

    public record Registration(@NotNull Long ownerUserId,
            @NotBlank @Size(max = 255) @Pattern(regexp = "(?:ExponentPushToken|ExpoPushToken)\\[[A-Za-z0-9_-]+\\]") String token) {
    }

    public record Removal(@NotBlank @Size(max = 255) String token) {
    }

    @PutMapping
    public void register(@Valid @RequestBody Registration r) {
        Long uid = SecurityUtil.getCurrentUserId();
        String sid = (String) org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getDetails();
        if (!uid.equals(r.ownerUserId())
                || db.queryForObject("SELECT COUNT(*) FROM users WHERE id=? AND status<>'withdrawn'", Integer.class,
                        uid) != 1)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        // min_notification_id 갱신은 user_id 갱신보다 앞에 둔다.
        db.update(
                """
                        INSERT INTO push_devices(user_id,expo_token,auth_session_id,enabled,min_notification_id)
                        VALUES(?,?,?,1,(SELECT COALESCE(MAX(id),0) FROM notifications))
                        ON DUPLICATE KEY UPDATE
                          session_version=IF(user_id=VALUES(user_id) AND auth_session_id=VALUES(auth_session_id) AND enabled=1,session_version,session_version+1),
                          min_notification_id=IF(user_id=VALUES(user_id) AND auth_session_id=VALUES(auth_session_id) AND enabled=1,min_notification_id,VALUES(min_notification_id)),
                          user_id=VALUES(user_id),auth_session_id=VALUES(auth_session_id),enabled=1,updated_at=NOW()
                        """,
                uid, r.token(), sid);
    }

    @DeleteMapping
    public void unregister(@Valid @RequestBody Removal r) {
        db.update("UPDATE push_devices SET enabled=0 WHERE user_id=? AND expo_token=? AND auth_session_id=?",
                SecurityUtil.getCurrentUserId(), r.token(),
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                        .getDetails());
    }
}