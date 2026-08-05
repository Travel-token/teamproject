package com.example.back.service;

import org.springframework.stereotype.Service;

import com.example.back.mapper.UserMapper;
import com.example.back.vo.UserVo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    
    private final UserMapper userMapper;
    
    @Override
    public UserVo findByEmail(String email) {
        log.debug(email);
        return userMapper.findByEmail(email);
    }

    @Override
    public void save(UserVo user) {
        log.equals(user) ; 
        userMapper.save(user);
    }
    
}
