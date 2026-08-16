package com.example.project.mapper;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.project.dto.user.UserBasicRow;
import com.example.project.dto.user.UserDetailResponse;
import com.example.project.dto.user.UserListItemResponse;
import com.example.project.dto.user.UserSearchCondition;

import java.util.List;

@Mapper
public interface UserMapper {

    /** 목록 조회 (검색/필터/페이징) */
    List<UserListItemResponse> selectUserList(@Param("cond") UserSearchCondition condition);

    /** 목록 조회용 총 개수 */
    long countUserList(@Param("cond") UserSearchCondition condition);

    /** 존재 여부 확인 (0 또는 1) */
    int existsById(@Param("id") Long id);

    /** 회원 기본 정보 (users 테이블) */
    UserBasicRow selectUserBasic(@Param("id") Long id);

    /** 참여한 여행 수 */
    int countUserTrips(@Param("id") Long id);

    /** 누적 지출액 합계 (본인이 결제자로 등록된 지출 합) */
    Long sumUserSpent(@Param("id") Long id);

    /** 최근 참여 여행방 목록 */
    List<UserDetailResponse.RecentTrip> selectUserRecentTrips(@Param("id") Long id, @Param("limit") int limit);

    /** 회원 상태(활성/정지) 변경 */
    void updateStatus(@Param("id") Long id, @Param("status") String status);
}
