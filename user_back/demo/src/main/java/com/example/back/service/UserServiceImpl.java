package com.example.back.service;

import org.springframework.stereotype.Service;

import com.example.back.mapper.UserMapper;
import com.example.back.vo.UserVo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserMapper userMapper;
    
    @Override
    public UserVo findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public void save(UserVo user) {
        userMapper.save(user);
    }
    
}
