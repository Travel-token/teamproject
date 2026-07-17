package com.example.project.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.project.domain.Admin;

@Mapper
public interface AdminMapper {

    Admin findByUsername(@Param("username") String username);

    void updateLastLoginAt(@Param("id") Long id);
}
