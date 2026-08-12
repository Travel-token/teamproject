package com.example.back.auth;

import org.springframework.stereotype.Service;

import com.example.back.vo.user.UserVo;
import com.example.back.recommendation.RecommendationService;
import com.example.back.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
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
                        // newUser.setStatus("active");
                        userService.saveid(newUser);

                        user = userService.findByEmail(email);

                }

                Long userId = user.getId();

                String token = jwtProvider.generateToken(
                                user.getId(),
                                user.getEmail());

                // flask 서버에 로그인한 유저 정보 전달
                recommendationService.sendLoginUser(userId);

                return LoginResponseDto.builder()
                                .userId(user.getId())
                                .name(user.getName())
                                .accessToken(token)
                                .build();

        }

}
