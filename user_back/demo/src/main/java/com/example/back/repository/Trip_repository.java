package com.example.back.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.vo.Trip_vo;
import com.example.back.vo.TripMember_vo;

// ============================================================
// Trip_repository : 여행+멤버 창고지기 (SQL은 Trip_mapper.xml)
// ============================================================
@Mapper
public interface Trip_repository {

    // ---------- 여행 ----------
    int insertTrip(Trip_vo trip);
    Trip_vo findById(Long id);
    List<Trip_vo> findAll();
    List<Trip_vo> findByStatus(String status);
    Trip_vo findActive();                       // ongoing 최신 1건
    int updateTrip(Trip_vo trip);
    int updateStatus(@Param("id") Long id, @Param("status") String status);
    int deleteTrip(Long id);
    int countByInviteCode(String invite_code);  // 초대코드 중복 검사용

    // ---------- 멤버 ----------
    int insertMember(TripMember_vo member);
    List<TripMember_vo> findMembersByTripId(Long trip_id);
    int deleteMember(Long id);
}
