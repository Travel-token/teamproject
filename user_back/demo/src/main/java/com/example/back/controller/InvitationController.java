package com.example.back.controller;

import com.example.back.service.NotificationEvents;
import com.example.back.service.TripAccess;
import com.example.back.util.SecurityUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class InvitationController {
    private final JdbcTemplate db;
    private final TripAccess access;
    private final NotificationEvents events;

    public record Invite(@NotBlank @Email @Size(max = 254) String email) {
    }

    private ResponseStatusException conflict(String text) {
        return new ResponseStatusException(HttpStatus.CONFLICT, text);
    }

    @PostMapping("/api/trips/{tripId}/invitations")
    @Transactional
    public Map<String, Object> invite(@PathVariable Long tripId, @Valid @RequestBody Invite body) {
        access.owner(tripId);
        access.mutable(tripId);
        if (!"ongoing".equals(db.queryForObject("SELECT status FROM trips WHERE id=?", String.class, tripId)))
            throw conflict("진행 중인 여행만 초대할 수 있어요.");
        var users = db.queryForList("SELECT id FROM users WHERE email=? AND status='active'", Long.class,
                body.email().trim());
        if (users.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "가입된 사용자를 찾을 수 없어요.");
        Long target = users.get(0);
        if (db.queryForObject("SELECT COUNT(*) FROM trip_members WHERE trip_id=? AND user_id=?", Integer.class, tripId,
                target) > 0)
            throw conflict("이미 참여한 사용자예요.");
        var rows = db.queryForList("SELECT * FROM trip_invitations WHERE trip_id=? AND invitee_id=? FOR UPDATE", tripId,
                target);
        if (!rows.isEmpty()) {
            var existing = rows.get(0);
            if ("pending".equals(existing.get("status"))
                    && ((Timestamp) existing.get("expires_at")).getTime() > System.currentTimeMillis())
                return Map.of("invitationId", existing.get("id"), "status", "pending");
            if (((Timestamp) existing.get("updated_at")).getTime() > System.currentTimeMillis() - 86400000)
                throw conflict("재초대는 하루 뒤에 가능해요.");
            db.update(
                    "UPDATE trip_invitations SET status='pending',inviter_id=?,version=version+1,expires_at=NOW()+INTERVAL 7 DAY,updated_at=NOW() WHERE id=?",
                    access.userId(), existing.get("id"));
        } else {
            db.update(
                    "INSERT INTO trip_invitations(trip_id,inviter_id,invitee_id,expires_at) VALUES(?,?,?,NOW()+INTERVAL 7 DAY)",
                    tripId, access.userId(), target);
        }
        var row = db.queryForMap("SELECT id,version FROM trip_invitations WHERE trip_id=? AND invitee_id=?", tripId,
                target);
        events.emit(target, tripId, "invite:" + row.get("id") + ":" + row.get("version"), "invite", "여행 초대",
                "새 여행 초대가 도착했어요. 알림함에서 수락하거나 거절해 주세요.", "invite");
        return Map.of("invitationId", row.get("id"), "status", "pending");
    }

    @GetMapping("/api/invitations")
    public List<Map<String, Object>> list() {
        // Pending invitations remain accessible when the user has opted out of invite
        // notifications.
        return db.queryForList(
                "SELECT i.id,i.trip_id tripId,t.name tripName,u.name inviterName,i.expires_at expiresAt FROM trip_invitations i JOIN trips t ON t.id=i.trip_id JOIN users u ON u.id=i.inviter_id WHERE i.invitee_id=? AND i.status='pending' AND i.expires_at>NOW() AND t.status='ongoing' AND NOT EXISTS(SELECT 1 FROM settlements s WHERE s.trip_id=i.trip_id) ORDER BY i.id DESC LIMIT 100",
                SecurityUtil.getCurrentUserId());
    }

    @PostMapping("/api/invitations/{id}/accept")
    @Transactional
    public Map<String, Object> accept(@PathVariable Long id) {
        Long uid = SecurityUtil.getCurrentUserId();
        var ids = db.queryForList("SELECT trip_id FROM trip_invitations WHERE id=? AND invitee_id=?", Long.class, id,
                uid);
        if (ids.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        Long tripId = ids.get(0);
        // All invitation mutations lock the trip first, then the invitation.
        var trips = db.queryForList("SELECT status FROM trips WHERE id=? FOR UPDATE", String.class, tripId);
        if (trips.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        var rows = db.queryForList("SELECT * FROM trip_invitations WHERE id=? AND invitee_id=? FOR UPDATE", id, uid);
        if (rows.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        var row = rows.get(0);
        if ("accepted".equals(row.get("status"))) {
            access.member(tripId);
            return Map.of("tripId", tripId);
        }
        if (!"pending".equals(row.get("status"))
                || ((Timestamp) row.get("expires_at")).getTime() <= System.currentTimeMillis())
            throw conflict("만료되거나 처리된 초대예요.");
        if (!"ongoing".equals(trips.get(0))
                || db.queryForObject("SELECT COUNT(*) FROM settlements WHERE trip_id=?", Integer.class, tripId) > 0)
            throw conflict("이미 종료되었거나 정산 중인 여행이에요.");
        if (db.queryForObject("SELECT COUNT(*) FROM trip_members WHERE trip_id=? AND user_id=?", Integer.class, tripId,
                uid) == 0) {
            String name = db.queryForObject("SELECT name FROM users WHERE id=?", String.class, uid);
            if (name == null || name.isBlank())
                name = "멤버";
            db.update(
                    "INSERT INTO trip_members(trip_id,user_id,display_name,short_name,color_code,role) VALUES(?,?,?,?, 'tp','member')",
                    tripId, uid, name, name.substring(0, Math.min(2, name.length())));
        }
        db.update("UPDATE trip_invitations SET status='accepted',updated_at=NOW() WHERE id=?", id);
        return Map.of("tripId", tripId);
    }

    @PostMapping("/api/invitations/{id}/decline")
    public void decline(@PathVariable Long id) {
        db.update(
                "UPDATE trip_invitations SET status='declined',updated_at=NOW() WHERE id=? AND invitee_id=? AND status='pending'",
                id, SecurityUtil.getCurrentUserId());
    }
}
