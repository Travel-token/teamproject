package com.example.back.service;

import com.example.back.vo.UserVo;

public interface UserService {
    
    // 로그인 
    UserVo findByEmail(String email);

    // 회원 가입 
    void save(UserVo user);
}
