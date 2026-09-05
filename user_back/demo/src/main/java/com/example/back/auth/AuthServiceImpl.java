package com.example.back.auth;

import org.springframework.stereotype.Service;

import com.example.back.vo.user.UserVo;
import com.example.back.recommendation.RecommendationService;
import com.example.back.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

        private final UserService userService;
        private final JwtProvider jwtProvider;
        private final RecommendationService recommendationService;

        @Override
        public LoginResponseDto devLogin(
                        DevLoginRequestDto request) {

                return login(
                                request.getEmail(),
                                LoginProvider.MOCK);

        }

        @Override
        public LoginResponseDto login(
                        String email,
                        LoginProvider loginProvider) {

                UserVo user = userService.findByEmail(email);

                // 회원이 없는 경우
                if (user == null) {

                        UserVo newUser = new UserVo();

                        newUser.setName("테스트유저");
                        newUser.setEmail(email);
                        newUser.setLoginProvider(null);
                        newUser.setProfileEmoji("😀");
                        newUser.setStatus(com.example.back.vo.enums.UserStatus.ACTIVE);
                        newUser.setDarkMode(false);
                        userService.saveid(newUser);

                        user = userService.findByEmail(email);

                }

                if (user.getStatus() != com.example.back.vo.enums.UserStatus.ACTIVE) {
                    throw new IllegalArgumentException("탈퇴하거나 비활성화된 계정입니다.");
                }
                Long userId = user.getId();

                String token = jwtProvider.generateToken(
                                user.getId(),
                                user.getEmail());

                // flask 서버에 로그인한 유저 정보 전달
                try {
                        recommendationService.sendLoginUser(userId);
                } catch (Exception e) {
                        log.warn("추천 서버 실행 x");

                }

                return LoginResponseDto.builder()
                                .userId(user.getId())
                                .name(user.getName())
                                .accessToken(token)
                                .build();

        }

}
