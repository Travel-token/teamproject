package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.Trip_RequestDto;
import com.example.demo.dto.Trip_ResponseDto;

// ============================================================
// Trip_service : 요리사의 "할 수 있는 일 목록" (메뉴판)
// [g 단계에서 추가된 것] getActiveTrip
// ============================================================
public interface Trip_service {

    // 여행방 만들기 (f-1 ~ f-7)
    Trip_ResponseDto createTrip(Trip_RequestDto request);

    // 여행방 전체 목록
    List<Trip_ResponseDto> getAllTrips();

    // [NEW] 현재 진행중인 여행 1건 (없으면 null 반환)
    Trip_ResponseDto getActiveTrip();
}
