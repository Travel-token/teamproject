package com.example.demo.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.vo.Trip_vo;

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
    // [h] 여행 1건 삭제. 반환값 int = "몇 줄이 지워졌나" (0이면 그런 방이 없었던 것)
    int deleteTrip(Long trip_id);

    // [h] 여행 1건 수정. 반환 int = 몇 줄이 바뀌었나 (0이면 그런 방 없음)
    int updateTrip(Trip_vo trip);

    // [h-6] 상태만 변경. 파라미터가 2개라서 @Param("이름표")로 구분해줘야
    //       XML의 #{trip_id}, #{status} 가 각각 누구인지 MyBatis가 알 수 있음
    int updateStatus(@Param("trip_id") Long trip_id, @Param("status") String status);

    // [g 잔여] 특정 상태의 여행 목록 (예: "ended" → 지난 여행들)
    java.util.List<Trip_vo> findByStatus(String status);

}