package com.example.back.service;

import java.util.List;

import com.example.back.dto.Trip_RequestDto;
import com.example.back.dto.Trip_ResponseDto;
import com.example.back.dto.TripMember_RequestDto;
import com.example.back.dto.TripMember_ResponseDto;

// ============================================================
// Trip_service : 여행+멤버 요리사 메뉴판
// ============================================================
public interface Trip_service {

    // 여행 (f, g, h)
    Trip_ResponseDto createTrip(Trip_RequestDto request);
    List<Trip_ResponseDto> getAllTrips(String status);   // status null이면 전체
    Trip_ResponseDto getActiveTrip();                    // 진행중 1건, 없으면 null
    Trip_ResponseDto getTrip(Long tripId);
    Trip_ResponseDto updateTrip(Long tripId, Trip_RequestDto request);
    Trip_ResponseDto changeStatus(Long tripId, String status);
    boolean deleteTrip(Long tripId);
    String getInviteCode(Long tripId);                   // 초대 코드 조회 (h-2)

    // 멤버 (h-2, h-3)
    TripMember_ResponseDto addMember(Long tripId, TripMember_RequestDto request);
    List<TripMember_ResponseDto> getMembers(Long tripId);
    boolean removeMember(Long memberId);
}
