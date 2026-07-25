package com.example.back.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.back.vo.UserVo;

@Mapper
public interface  UserMapper {
    UserVo findByEmail(String email);  
    void save(UserVo user);
    void delete(Long id );
}
