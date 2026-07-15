package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.Trip_RequestDto;
import com.example.demo.dto.Trip_ResponseDto;

public interface Trip_service {

    // 여행방 만들기 (f-1 ~ f-7)
    Trip_ResponseDto createTrip(Trip_RequestDto request);

    // 여행방 전체 목록 (테스트 및 e-1 정산홈 목록용)
    List<Trip_ResponseDto> getAllTrips();
}