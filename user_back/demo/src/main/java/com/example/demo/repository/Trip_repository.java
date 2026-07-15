package com.example.demo.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.vo.Trip_vo;

// ============================================================
// Trip_repository : 창고지기 (DB에 드나드는 유일한 통로)
// [g 단계에서 추가된 것] findActive — 진행중(ongoing) 여행 1건 찾기
// ============================================================
@Mapper
public interface Trip_repository {

    // 여행방 1건 저장. 저장 후 trip.getTrip_id()에 새 번호가 자동으로 채워짐
    int insertTrip(Trip_vo trip);

    // 고유번호로 여행방 1건 조회
    Trip_vo findById(Long trip_id);

    // 전체 여행방 목록 조회 (최신순)
    List<Trip_vo> findAll();

    // [NEW] 진행중(status='ongoing')인 여행 중 가장 최근 것 1건
    //       없으면 null이 반환됨 (자바에서 "없음"을 뜻하는 값)
    Trip_vo findActive();
}
