package com.example.back.util;

import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtil {



    private SecurityUtil() {
    }

    public static Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        if (principal instanceof String) {
            return Long.parseLong((String) principal);
        }
        throw new IllegalStateException("인증 정보에서 사용자 ID를 확인할 수 없습니다.");
    }
}
    