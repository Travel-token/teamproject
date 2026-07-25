package com.example.back.service;

import com.example.back.vo.UserVo;

public interface UserService {
    
    UserVo findByEmail(String email);

    void save(UserVo user);
}
