package com.example.back.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.vo.user.UserVo;

@Mapper
public interface UserMapper {

    // 로그인
    UserVo findByEmail(String email);

    // 회원 가입
    void saveid(UserVo user);

    // 마이페이지 - 내 정보 조회
    UserVo findById(@Param("id") Long id);

    // 마이페이지 - 이름 수정
    int updateName(@Param("id") Long id, @Param("name") String name);

    // 마이페이지 - 송금 계좌 수정
    int updateAccount(@Param("id") Long id, @Param("bankName") String bankName,
            @Param("accountNumber") String accountNumber);

    // 마이페이지 - 다크 모드 수정
    int updateDarkMode(@Param("id") Long id, @Param("darkMode") Boolean darkMode);

    int withdraw(@Param("id") Long id);

}
