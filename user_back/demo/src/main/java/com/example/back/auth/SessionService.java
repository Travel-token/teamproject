package com.example.back.auth;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class SessionService {
    private final JdbcTemplate db;
    private final JwtProvider jwt;
    private final SessionTokenCodec codec;
    private final long accessMillis, refreshMillis;

    public SessionService(JdbcTemplate db, JwtProvider jwt,
            @Value("${session.refresh-secret}") String secret,
            @Value("${session.access-seconds:900}") long accessSeconds,
            @Value("${session.refresh-days:30}") long refreshDays) {
        this.db = db;
        this.jwt = jwt;
        this.codec = new SessionTokenCodec(secret);
        if (accessSeconds < 30 || accessSeconds > 3600 || refreshDays < 1 || refreshDays > 90)
            throw new IllegalArgumentException("Invalid session lifetime");
        accessMillis = accessSeconds * 1000;
        refreshMillis = refreshDays * 86400000;
    }

    private ResponseStatusException denied() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "다시 로그인해 주세요.");
    }

    private Map<String, Object> activeUser(Long uid) {
        var users = db.queryForList("SELECT id,name,email FROM users WHERE id=? AND status='active'", uid);
        if (users.isEmpty())
            throw denied();
        return users.get(0);
    }

    @Transactional
    public LoginResponseDto issue(Long uid) {
        var user = activeUser(uid);
        String sid = UUID.randomUUID().toString();
        long expires = System.currentTimeMillis() + refreshMillis;
        String token = codec.token(sid, 1);
        db.update("INSERT INTO auth_sessions(id,user_id,refresh_version,refresh_hash,expires_at) VALUES(?,?,1,?,?)",
                sid, uid, SessionTokenCodec.hash(token), new Timestamp(expires));
        return response(user, sid, 1, expires);
    }

    // A verified token older than the 30-second retry grace revokes its session on
    // replay.
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public LoginResponseDto refresh(String token) {
        var proof = codec.verify(token);
        if (proof == null)
            throw denied();
        var rows = db.queryForList("SELECT * FROM auth_sessions WHERE id=? FOR UPDATE", proof.sessionId());
        if (rows.isEmpty())
            throw denied();
        var row = rows.get(0);
        long now = System.currentTimeMillis(), expires = ((Timestamp) row.get("expires_at")).getTime();
        if (row.get("revoked_at") != null || expires <= now)
            throw denied();
        long version = ((Number) row.get("refresh_version")).longValue();
        var user = activeUser(((Number) row.get("user_id")).longValue());
        if (proof.version() == version && SessionTokenCodec.hash(token).equals(row.get("refresh_hash"))) {
            version++;
            db.update(
                    "UPDATE auth_sessions SET refresh_version=?,refresh_hash=?,retry_until=?,updated_at=NOW() WHERE id=?",
                    version, SessionTokenCodec.hash(codec.token(proof.sessionId(), version)),
                    new Timestamp(now + 30000), proof.sessionId());
        } else if (!(proof.version() == version - 1 && row.get("retry_until") != null
                && ((Timestamp) row.get("retry_until")).getTime() > now)) {
            db.update("UPDATE auth_sessions SET revoked_at=NOW() WHERE id=?", proof.sessionId());
            throw denied();
        }
        return response(user, proof.sessionId(), version, expires);
    }

    @Transactional
    public void logout(String token) {
        var proof = codec.verify(token);
        // Possession of any authentic token for this session permits idempotent
        // revocation.
        if (proof != null)
            db.update("UPDATE auth_sessions SET revoked_at=COALESCE(revoked_at,NOW()) WHERE id=?", proof.sessionId());
    }

    public boolean active(String sid, Long uid) {
        return sid != null && db.queryForObject(
                "SELECT COUNT(*) FROM auth_sessions a JOIN users u ON u.id=a.user_id WHERE a.id=? AND a.user_id=? AND a.revoked_at IS NULL AND a.expires_at>NOW() AND u.status='active'",
                Integer.class, sid, uid) == 1;
    }

    private LoginResponseDto response(Map<String, Object> user, String sid, long version, long refreshExpires) {
        Long uid = ((Number) user.get("id")).longValue();
        long accessExpires = Math.min(System.currentTimeMillis() + accessMillis, refreshExpires);
        return LoginResponseDto.builder().userId(uid).name((String) user.get("name")).sessionId(sid)
                .accessToken(jwt.generateToken(uid, (String) user.get("email"), sid, accessExpires))
                .refreshToken(codec.token(sid, version)).accessExpiresAt(accessExpires).refreshExpiresAt(refreshExpires)
                .build();
    }
}
