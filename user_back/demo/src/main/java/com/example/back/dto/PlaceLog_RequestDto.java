package com.example.back.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * ============================================================
 * PlaceLog_RequestDto : "동선(방문 장소) 추가" 요청 소포
 * ------------------------------------------------------------
 * [역할]
 *  - 명세서 k(장소 추가)에서 사용. 앱의 "동선에 추가" 버튼이 보내는 내용.
 * ============================================================
 */
@Getter
@Setter
public class PlaceLog_RequestDto {

    /** 장소명 (필수). 비면 400 거절 */
    private String name;

    /** 메모 (선택) */
    private String memo;

    /**
     * 방문 시각 "yyyy-MM-dd HH:mm" (선택).
     * - 비워 보내면 Service가 "지금 시각"으로 채운다.
     * - 초(:ss)가 없으면 Service가 ":00"을 붙여 DATETIME 형식으로 맞춘다.
     * - 형식이 아예 틀리면 400 거절.
     */
    private String visitedAt;

    /** 관광공사 등록 장소를 선택했을 때만 그 장소의 id (자유 입력이면 null) */
    private Long placeId;

    /**
     * GPS 자동 감지로 추가된 기록인지 (선택, 기본 false).
     * 자바에서는 true/false로 다루고, DB에는 1/0으로 저장된다(Service가 변환).
     */
    private Boolean detectedByGps;
}
