package com.example.back.controller;

import com.example.back.service.NotificationEvents;
import com.example.back.service.TripAccess;
import com.example.back.auth.SessionTokenCodec;
import com.example.back.util.SecurityUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/notification-events")
public class NotificationEventController {
    private final JdbcTemplate db;
    private final TripAccess access;
    private final NotificationEvents events;
    private final Set<Long> adminIds;
    private final byte[] adminSecret;

    public NotificationEventController(JdbcTemplate db, TripAccess access, NotificationEvents events,
            @Value("${notifications.marketing-admin-ids:}") String ids,
            @Value("${notifications.marketing-admin-key:}") String adminKey) {
        this.db = db;
        this.access = access;
        this.events = events;
        this.adminSecret = adminKey.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        adminIds = new HashSet<>();
        for (String id : ids.split(","))
            if (!id.isBlank())
                adminIds.add(Long.valueOf(id.trim()));
    }

    public record Gps(@NotNull Long tripId,
            @NotBlank @Size(max = 120) @Pattern(regexp = "[\\p{L}\\p{N} .-]+") String administrativeArea) {}

    @PostMapping("/gps")
    @Transactional
    public Map<String, Boolean> gps(@Valid @RequestBody Gps body) {
        access.member(body.tripId());
        if (!"ongoing".equals(db.queryForObject("SELECT status FROM trips WHERE id=?", String.class, body.tripId()))) return Map.of("created", false);
        Long uid=SecurityUtil.getCurrentUserId();
        if(db.queryForObject("SELECT COUNT(*) FROM users u LEFT JOIN user_settings s ON s.user_id=u.id WHERE u.id=? AND COALESCE(s.gps_enabled,1)=1",Integer.class,uid)!=1) return Map.of("created",false);
        String area=body.administrativeArea().trim().replaceAll("\\s+"," ");
        String key="gps-area:"+body.tripId()+":"+SessionTokenCodec.hash(area).substring(0,12)+":"+(System.currentTimeMillis()/1800000);
        return Map.of("created",events.emit(uid,body.tripId(),key,"gps","여행 지역 알림",area+" 지역을 여행 중이에요. 여행 지도를 확인해 보세요.","open_map"));
    }

    public record Marketing(@NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{1,80}") String campaignKey,
            @NotBlank @Size(max = 80) String title, @NotBlank @Size(max = 350) String body) {
    }

    @PostMapping("/marketing")
    @Transactional
    public Map<String, Object> marketing(@Valid @RequestBody Marketing body,
            @RequestHeader(name = "X-Marketing-Key", required = false) String key) {
        Long uid = SecurityUtil.getCurrentUserId();
        // A separate server-side administrator key is required even with a valid user
        // session.
        if (adminSecret.length < 32 || key == null || !adminIds.contains(uid) || !java.security.MessageDigest
                .isEqual(adminSecret, key.getBytes(java.nio.charset.StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 인증이 필요해요.");
        String hash = SessionTokenCodec.hash(body.title() + "\n" + body.body());
        var existing = db.queryForList(
                "SELECT content_hash,recipient_count FROM marketing_campaigns WHERE campaign_key=?",
                body.campaignKey());
        if (!existing.isEmpty())
            return campaignResult(body.campaignKey(), hash, existing.get(0));
        int hour = ZonedDateTime.now(ZoneId.of("Asia/Seoul")).getHour();
        if (hour < 9 || hour >= 20)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "마케팅 발송 시간은 한국 시간 09:00~20:00예요.");
        try {
            db.update("INSERT INTO marketing_campaigns(campaign_key,content_hash,created_by) VALUES(?,?,?)",
                    body.campaignKey(), hash, uid);
        } catch (DuplicateKeyException e) {
            return campaignResult(body.campaignKey(), hash, db.queryForMap(
                    "SELECT content_hash,recipient_count FROM marketing_campaigns WHERE campaign_key=? FOR UPDATE",
                    body.campaignKey()));
        }
        int count = db.update(
                "INSERT INTO notifications(user_id,trip_id,type,title,body,action_type,is_read,created_at) SELECT u.id,NULL,'system',?,?,'marketing',0,NOW() FROM users u JOIN user_settings s ON s.user_id=u.id WHERE u.status='active' AND s.marketing_enabled=1",
                "(광고) " + body.title(), body.body() + "\n수신 거부: 마이페이지 > 마케팅 알림 끄기");
        db.update("UPDATE marketing_campaigns SET recipient_count=? WHERE campaign_key=?", count, body.campaignKey());
        return Map.of("campaignKey", body.campaignKey(), "recipients", count);
    }

    private Map<String, Object> campaignResult(String key, String hash, Map<String, Object> row) {
        if (!hash.equals(row.get("content_hash")))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "같은 campaignKey에 다른 내용을 사용할 수 없어요.");
        return Map.of("campaignKey", key, "recipients", row.get("recipient_count"));
    }
}