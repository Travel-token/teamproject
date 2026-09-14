package com.example.back.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.*;

@Configuration
@EnableScheduling
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "integrations.push.enabled", havingValue = "true")
public class PushWorker {
    private final JdbcTemplate db;
    private final RestClient http;
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PushWorker.class);

    @org.springframework.beans.factory.annotation.Autowired
    public PushWorker(JdbcTemplate db, @Value("${integrations.expo.access-token:}") String accessToken) {
        this(db, buildClient(accessToken));
    }

    PushWorker(JdbcTemplate db, RestClient http) {
        this.db = db;
        this.http = http;
    }

    private static RestClient buildClient(String accessToken) {
        var factory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(10));
        var b = RestClient.builder().baseUrl("https://exp.host/--/api/v2/push").requestFactory(factory)
                .defaultHeader("Content-Type", "application/json");
        if (!accessToken.isBlank())
            b.defaultHeader("Authorization", "Bearer " + accessToken);
        return b.build();
    }

    @Scheduled(fixedDelay = 5000)
    public void tick() {
        // 만료된 처리 잠금을 회수한다. 외부 전송이 이미 끝났다면 중복 수신 가능성이 있다.
        db.update(
                "UPDATE push_outbox SET state=IF(ticket_id IS NULL,'pending','ticket') WHERE state IN ('sending','checking') AND available_at<NOW()");
        db.update(
                """
                        INSERT INTO push_outbox(notification_id,device_id,user_id,session_version)
                        SELECT n.id,d.id,n.user_id,d.session_version FROM notifications n
                        JOIN push_devices d ON d.user_id=n.user_id AND d.enabled=1
                        JOIN auth_sessions a ON a.id=d.auth_session_id AND a.user_id=d.user_id AND a.revoked_at IS NULL AND a.expires_at>NOW()
                        JOIN users u ON u.id=n.user_id AND u.status<>'withdrawn'
                        WHERE n.id>d.min_notification_id AND n.created_at>NOW()-INTERVAL 1 DAY
                          AND d.updated_at>NOW()-INTERVAL 30 DAY AND n.is_read=0
                        ON DUPLICATE KEY UPDATE notification_id=VALUES(notification_id)
                        """);
        var jobs = db.queryForList(
                "SELECT id,state FROM push_outbox WHERE state IN ('pending','ticket') AND available_at<=NOW() ORDER BY id LIMIT 20");
        for (var job : jobs) {
            long id = ((Number) job.get("id")).longValue();
            String old = (String) job.get("state");
            boolean receipt = old.equals("ticket");
            if (db.update(
                    "UPDATE push_outbox SET state=?,available_at=NOW()+INTERVAL 2 MINUTE,send_attempts=send_attempts+? WHERE id=? AND state=? AND available_at<=NOW()",
                    receipt ? "checking" : "sending", receipt ? 0 : 1, id, old) != 1)
                continue;
            try {
                process(id, receipt);
            } catch (Exception e) {
                // 토큰/알림 본문/비밀키는 로그에 넣지 않는다.
                log.warn("Push job {} failed: {}", id, e.getClass().getSimpleName());
                if (e instanceof RestClientResponseException r && r.getStatusCode().is4xxClientError()
                        && r.getStatusCode().value() != 429) {
                    finish(id, "dead", "HTTP_" + r.getStatusCode().value());
                } else
                    retry(id, receipt, "NETWORK_OR_RATE_LIMIT");
            }
        }
    }

    private void process(long id, boolean receipt) {
        var rows = db.queryForList(
                """
                        SELECT o.*,d.expo_token FROM push_outbox o
                        JOIN push_devices d ON d.id=o.device_id AND d.user_id=o.user_id AND d.session_version=o.session_version AND d.enabled=1
                        JOIN auth_sessions a ON a.id=d.auth_session_id AND a.user_id=d.user_id AND a.revoked_at IS NULL AND a.expires_at>NOW()
                        JOIN users u ON u.id=o.user_id AND u.status<>'withdrawn'
                        JOIN notifications n ON n.id=o.notification_id AND n.user_id=o.user_id
                        LEFT JOIN user_settings s ON s.user_id=o.user_id
                        WHERE o.id=? AND o.created_at>NOW()-INTERVAL 1 DAY
                          AND d.updated_at>NOW()-INTERVAL 30 DAY AND n.is_read=0
                          AND CASE WHEN n.action_type='marketing' THEN COALESCE(s.marketing_enabled,0) ELSE CASE n.type
                            WHEN 'settle' THEN COALESCE(s.notif_enabled,1)
                            WHEN 'invite' THEN COALESCE(s.invite_notif_enabled,1)
                            WHEN 'gps' THEN COALESCE(s.gps_enabled,1)
                            WHEN 'feed_recommend' THEN COALESCE(s.notif_enabled,1)
                            ELSE 1 END END = 1
                        """,
                id);
        if (rows.isEmpty()) {
            finish(id, "dead", "DISABLED_READ_OR_EXPIRED");
            return;
        }
        var row = rows.get(0);
        JsonNode result;
        if (receipt) {
            String ticket = (String) row.get("ticket_id");
            JsonNode response = http.post().uri("/getReceipts")
                    .body(Map.of("ids", List.of(ticket))).retrieve().body(JsonNode.class);
            if (response == null || response.has("errors"))
                throw new IllegalStateException("Invalid receipt response");
            result = response.path("data").path(ticket);
            if (result.isMissingNode()) {
                retry(id, true, "RECEIPT_PENDING");
                return;
            }
        } else {
            if (((Number) row.get("send_attempts")).intValue() > 8) {
                finish(id, "dead", "RETRY_LIMIT");
                return;
            }
            var n = db.queryForMap("SELECT trip_id,type,action_type FROM notifications WHERE id=?",
                    row.get("notification_id"));
            Map<String, Object> data = new HashMap<>();
            data.put("notificationId", String.valueOf(row.get("notification_id")));
            data.put("userId", String.valueOf(row.get("user_id")));
            data.put("type", n.get("type"));
            if (n.get("action_type") != null)
                data.put("actionType", n.get("action_type"));
            boolean marketing = "marketing".equals(n.get("action_type"));
            if (marketing) {
                int hour = java.time.ZonedDateTime.now(java.time.ZoneId.of("Asia/Seoul")).getHour();
                if (hour < 9 || hour >= 20) {
                    var now = java.time.ZonedDateTime.now(java.time.ZoneId.of("Asia/Seoul"));
                    var next = now.withHour(9).withMinute(0).withSecond(0).withNano(0);
                    if (!next.isAfter(now))
                        next = next.plusDays(1);
                    db.update(
                            "UPDATE push_outbox SET state='pending',last_error='OUTSIDE_MARKETING_HOURS',available_at=?,send_attempts=GREATEST(0,send_attempts-1) WHERE id=?",
                            java.sql.Timestamp.from(next.toInstant()), id);
                    return;
                }
            }
            if (n.get("trip_id") != null)
                data.put("tripId", String.valueOf(n.get("trip_id")));
            // 잠금화면에 금액/계좌/개인정보를 노출하지 않고 앱 안에서 인증 후 조회한다.
            JsonNode response = http.post().uri("/send").body(Map.of(
                    "to", row.get("expo_token"), "title", marketing ? "(광고) 여행 정산 앱" : "여행 정산 앱",
                    "body", marketing ? "새 혜택 알림이 있어요. 수신 거부: 마이페이지 > 마케팅 알림" : "새 알림이 있습니다. 앱에서 확인해 주세요.",
                    "sound", "default", "channelId", "travel", "priority", "high", "ttl", 3600, "data", data))
                    .retrieve().body(JsonNode.class);
            if (response == null || response.has("errors"))
                throw new IllegalStateException("Invalid send response");
            result = response.path("data");
        }
        if ("ok".equals(result.path("status").asText())) {
            if (receipt)
                finish(id, "delivered", null);
            else {
                String ticket = result.path("id").asText();
                if (ticket.isBlank())
                    throw new IllegalStateException("Missing ticket");
                db.update(
                        "UPDATE push_outbox SET state='ticket',ticket_id=?,last_error=NULL,available_at=NOW()+INTERVAL 1 MINUTE WHERE id=?",
                        ticket, id);
            }
        } else {
            String error = result.path("details").path("error").asText("UNKNOWN_EXPO_ERROR");
            if (error.equals("DeviceNotRegistered")) {
                db.update(
                        "UPDATE push_devices SET enabled=0 WHERE id=? AND user_id=? AND expo_token=? AND session_version=?",
                        row.get("device_id"), row.get("user_id"), row.get("expo_token"), row.get("session_version"));
                finish(id, "dead", error);
            } else if (error.equals("MessageRateExceeded")) {
                // 새 전송이 필요하다. receipt 자체를 재조회하는 것으로 해결되지 않는다.
                db.update("UPDATE push_outbox SET ticket_id=NULL WHERE id=?", id);
                retry(id, false, error);
            } else
                finish(id, "dead", error);
        }
    }

    private void retry(long id, boolean receipt, String error) {
        db.update("UPDATE push_outbox SET state=?,last_error=?,available_at=NOW()+INTERVAL 1 MINUTE WHERE id=?",
                receipt ? "ticket" : "pending", error, id);
    }

    private void finish(long id, String state, String error) {
        db.update("UPDATE push_outbox SET state=?,last_error=? WHERE id=?", state, error, id);
    }
}
