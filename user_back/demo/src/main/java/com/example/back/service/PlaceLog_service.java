package com.example.back.service;

import java.util.List;

import com.example.back.dto.PlaceLog_RequestDto;
import com.example.back.dto.PlaceLog_ResponseDto;

// ============================================================
// PlaceLog_service : 동선 요리사 메뉴판 (k)
// ============================================================
public interface PlaceLog_service {

    PlaceLog_ResponseDto addLog(Long tripId, PlaceLog_RequestDto request);
    List<PlaceLog_ResponseDto> getLogs(Long tripId);
    boolean deleteLog(Long logId);
}
