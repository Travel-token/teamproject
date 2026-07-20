package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.Place_RequestDto;
import com.example.demo.dto.Place_ResponseDto;

// ============================================================
// Place_service : 장소 요리사 메뉴판 (k 단계)
// ============================================================
public interface Place_service {

    // 장소 기록 추가 (k-1~k-4)
    Place_ResponseDto addPlace(Long tripId, Place_RequestDto request);

    // 특정 여행방의 장소 목록
    List<Place_ResponseDto> getPlaces(Long tripId);

    // 장소 기록 삭제
    boolean deletePlace(Long placeId);
}