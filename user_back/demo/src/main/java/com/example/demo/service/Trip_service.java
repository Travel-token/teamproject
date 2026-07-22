package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.Trip_RequestDto;
import com.example.demo.dto.Trip_ResponseDto;

// [g 단계에서 추가된 것] getActiveTrip
public interface Trip_service {

    // 여행방 만들기 (f-1 ~ f-7)
    Trip_ResponseDto createTrip(Trip_RequestDto request);

    // 여행방 목록. status가 null이면 전체, "ended"면 지난 여행만 (g 잔여)
    List<Trip_ResponseDto> getAllTrips(String status);

    // [NEW] 현재 진행중인 여행 1건 (없으면 null 반환)
    Trip_ResponseDto getActiveTrip();

    // [h] 여행 삭제. 성공하면 true, 그런 방이 없으면 false
    boolean deleteTrip(Long tripId);

    // [h] 여행 수정. 수정 후의 최신 모습을 돌려줌
    Trip_ResponseDto updateTrip(Long tripId, Trip_RequestDto request);

    // [h-6] 여행 상태 변경 (진행중 → 종료/보관). 바뀐 최신 모습을 돌려줌
    Trip_ResponseDto changeStatus(Long tripId, String status);

}