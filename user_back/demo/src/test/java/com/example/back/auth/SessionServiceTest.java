package com.example.back.auth;

import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.sql.Timestamp;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class SessionServiceTest {
    static final String SECRET = "a-long-independent-test-only-secret-32bytes";
    static final String SID = "12345678-1234-1234-1234-123456789abc";
    JdbcTemplate db;
    SessionService service;
    SessionTokenCodec codec;
    Map<String, Object> row;

    @BeforeEach
    void setup() {
        db = mock(JdbcTemplate.class);
        codec = new SessionTokenCodec(SECRET);
        service = new SessionService(db, new JwtProvider(SECRET), SECRET, 900, 30);
        row = new HashMap<>();
        row.put("user_id", 7L);
        row.put("refresh_version", 1L);
        row.put("refresh_hash", SessionTokenCodec.hash(codec.token(SID, 1)));
        row.put("expires_at", new Timestamp(System.currentTimeMillis() + 86400000));
        when(db.queryForList(startsWith("SELECT * FROM auth_sessions"), eq(SID))).thenAnswer(i -> List.of(row));
        when(db.queryForList(startsWith("SELECT id,name,email FROM users"), eq(7L)))
                .thenReturn(List.of(Map.of("id", 7L, "name", "테스트", "email", "unit@example.invalid")));
    }

    @Test
    void issueIncludesVerifiableSessionIdAndBoundedExpiry() {
        var result = service.issue(7L);
        var claims = new JwtProvider(SECRET).getClaims(result.getAccessToken());
        assertEquals(result.getSessionId(), claims.get("sid"));
        assertEquals("7", claims.getSubject());
        assertTrue(result.getAccessExpiresAt() <= System.currentTimeMillis() + 900000);
        assertEquals(result.getSessionId(), codec.verify(result.getRefreshToken()).sessionId());
    }

    @Test
    void refreshRotatesAndStoresOnlyHash() {
        var result = service.refresh(codec.token(SID, 1));
        assertEquals(codec.token(SID, 2), result.getRefreshToken());
        verify(db).update(startsWith("UPDATE auth_sessions SET refresh_version="), eq(2L),
                eq(SessionTokenCodec.hash(result.getRefreshToken())), any(Timestamp.class), eq(SID));
    }

    @Test
    void lostResponseRetryReturnsSameTokenWithinGrace() {
        row.put("refresh_version", 2L);
        row.put("retry_until", new Timestamp(System.currentTimeMillis() + 30000));
        assertEquals(codec.token(SID, 2), service.refresh(codec.token(SID, 1)).getRefreshToken());
        verify(db, never()).update(startsWith("UPDATE auth_sessions SET refresh_version="), any(Object[].class));
    }

    @Test
    void replayOutsideGraceRevokesSession() {
        row.put("refresh_version", 2L);
        row.put("retry_until", new Timestamp(1));
        assertEquals(401, assertThrows(ResponseStatusException.class, () -> service.refresh(codec.token(SID, 1)))
                .getStatusCode().value());
        verify(db).update("UPDATE auth_sessions SET revoked_at=NOW() WHERE id=?", SID);
    }

    @Test
    void forgedTokenCannotRevokeAnotherSession() {
        String forged = new SessionTokenCodec("another-independent-secret-at-least-32bytes").token(SID, 1);
        assertThrows(ResponseStatusException.class, () -> service.refresh(forged));
        verify(db, never()).update(anyString(), any(Object[].class));
    }

    @Test
    void revokedSessionCannotRefresh() {
        row.put("revoked_at", new Timestamp(System.currentTimeMillis()));
        assertThrows(ResponseStatusException.class, () -> service.refresh(codec.token(SID, 1)));
    }

    @Test
    void expiredSessionCannotRefresh() {
        row.put("expires_at", new Timestamp(1));
        assertThrows(ResponseStatusException.class, () -> service.refresh(codec.token(SID, 1)));
    }

    @Test
    void logoutAcceptsAuthenticOldTokenForOfflineRetry() {
        service.logout(codec.token(SID, 1));
        verify(db).update("UPDATE auth_sessions SET revoked_at=COALESCE(revoked_at,NOW()) WHERE id=?", SID);
    }
}
