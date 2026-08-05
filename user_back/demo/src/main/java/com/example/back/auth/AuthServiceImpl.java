package com.example.back.auth;

import org.springframework.stereotype.Service;

import com.example.back.service.UserService;
import com.example.back.vo.UserVo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    

    private final UserService userService;
    private final JwtProvider jwtProvider;



    @Override
    public LoginResponseDto devLogin(
            DevLoginRequestDto request) {

        return login(
                request.getEmail(),
                LoginProvider.MOCK
        );

    }


    @Override
    public LoginResponseDto login(
            String email,
            LoginProvider loginProvider) {


        UserVo user =
                userService.findByEmail(email);


        // 회원이 없는 경우
        if(user == null){

            UserVo newUser = new UserVo();

            newUser.setName("테스트유저");
            newUser.setEmail(email);
            newUser.setLoginProvider(loginProvider.getValue());
            newUser.setProfileEmoji("😀");
            newUser.setStatus("active");
            userService.save(newUser);

            user = userService.findByEmail(email);

        }


        String token =
                jwtProvider.generateToken(
                        user.getId(),
                        user.getEmail()
                );


        return LoginResponseDto.builder()
                .userId(user.getId())
                .name(user.getName())
                .accessToken(token)
                .build();

    }
    
}
