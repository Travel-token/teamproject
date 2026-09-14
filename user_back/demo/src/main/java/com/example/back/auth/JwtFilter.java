package com.example.back.auth;

import java.io.IOException;
import java.util.Collections;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
        private final JwtProvider jwtProvider;
        private final SessionService sessions;

        @Override
        protected boolean shouldNotFilter(HttpServletRequest request) {
                return request.getServletPath().startsWith("/api/auth/") || "OPTIONS".equals(request.getMethod());
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                        throws ServletException, IOException {
                String bearer = request.getHeader("Authorization");
                if (bearer != null && bearer.startsWith("Bearer ")) {
                        Long uid;
                        String sid;
                        try {
                                var claims = jwtProvider.getClaims(bearer.substring(7));
                                uid = Long.valueOf(claims.getSubject());
                                sid = claims.get("sid", String.class);
                        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
                                unauthorized(response);
                                return;
                        }
                        // DB failures are server errors, not invalid credentials; clients must retain
                        // refresh tokens.
                        if (!sessions.active(sid, uid)) {
                                unauthorized(response);
                                return;
                        }
                        var authentication = new UsernamePasswordAuthenticationToken(uid, null,
                                        Collections.emptyList());
                        authentication.setDetails(sid);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                }
                chain.doFilter(request, response);
        }

        static void unauthorized(HttpServletResponse response) throws IOException {
                response.setStatus(401);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"다시 로그인해 주세요.\"}");
        }
}
