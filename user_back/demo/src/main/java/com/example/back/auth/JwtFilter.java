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
        private final com.example.back.mapper.UserMapper userMapper;

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain) throws ServletException, IOException {

                String token = resolveToken(request);

                if (token != null && jwtProvider.validateToken(token)) {

                        Long userId = jwtProvider.getUserId(token);
                        var user = userMapper.findById(userId);
                        if (user == null || user.getStatus() != com.example.back.vo.enums.UserStatus.ACTIVE) {
                            response.sendError(401, "사용할 수 없는 계정입니다."); return;
                        }

                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                        userId,
                                        null,
                                        Collections.emptyList());

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                }

                filterChain.doFilter(request, response);
        }

        private String resolveToken(HttpServletRequest request) {
                String bearer = request.getHeader("Authorization");
                if (bearer != null && bearer.startsWith("Bearer ")) {
                        return bearer.substring(7);
                }
                return null;
        }
}