package com.example.back.dto;

import lombok.Getter;
import lombok.Setter;

// ============================================================
// PlaceLog_RequestDto : 동선(장소 방문 기록) 추가 소포 (k)
// ============================================================
@Setter
@Getter
public class PlaceLog_RequestDto {

    private String name;        // 필수
    private String memo;        // 선택
    private String visitedAt;   // "2026-05-05 14:00" (비우면 서버가 현재 시각)
    private Long placeId;       // 관광공사 장소 연결 (선택)
    private Boolean detectedByGps; // GPS 자동 감지 여부 (선택, 기본 false)

    public PlaceLog_RequestDto() {
    }

}
