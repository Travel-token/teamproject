package com.example.back.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Deterministic refresh rotation lets a retry within the grace period recover
 * the same token.
 */
public final class SessionTokenCodec {
    private final byte[] secret;

    public record Proof(String sessionId, long version) {
    }

    public SessionTokenCodec(String key) {
        secret = key.getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32)
            throw new IllegalArgumentException("SESSION_REFRESH_SECRET must be at least 32 bytes");
    }

    public String token(String sid, long version) {
        String payload = sid + "." + version;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return payload + "." + Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.US_ASCII)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    public Proof verify(String value) {
        if (value == null || !value.matches("[a-f0-9-]{36}\\.[0-9]{1,12}\\.[A-Za-z0-9_-]{43}"))
            return null;
        String[] p = value.split("\\.");
        try {
            String sid = java.util.UUID.fromString(p[0]).toString();
            long version = Long.parseLong(p[1]);
            if (version < 1 || !MessageDigest.isEqual(value.getBytes(StandardCharsets.US_ASCII),
                    token(sid, version).getBytes(StandardCharsets.US_ASCII)))
                return null;
            return new Proof(sid, version);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public static String hash(String token) {
        try {
            return java.util.HexFormat.of()
                    .formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
