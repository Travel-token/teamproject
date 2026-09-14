package com.example.back.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DuplicateKeyException;

@Service
@RequiredArgsConstructor
public class NotificationEvents {
    private final JdbcTemplate db;

    @Transactional
    public boolean emit(Long uid, Long tripId, String key, String type, String title, String body, String action) {
        // Types/columns are server constants, never request-controlled SQL identifiers.
        String preference = switch (type) {
            case "invite" -> "invite_notif_enabled";
            case "gps" -> "gps_enabled";
            default -> throw new IllegalArgumentException("Unsupported event");
        };
        if (db.queryForObject(
                "SELECT COUNT(*) FROM users u LEFT JOIN user_settings s ON s.user_id=u.id WHERE u.id=? AND u.status='active' AND COALESCE(s."
                        + preference + ",1)=1",
                Integer.class, uid) != 1)
            return false;
        try {
            db.update("INSERT INTO notification_events(user_id,event_key) VALUES(?,?)", uid, key);
        } catch (DuplicateKeyException e) {
            return false;
        }
        db.update(
                "INSERT INTO notifications(user_id,trip_id,type,title,body,action_type,is_read,created_at) VALUES(?,?,?,?,?,?,0,NOW())",
                uid, tripId, type, title, body, action);
        return true;
    }
}