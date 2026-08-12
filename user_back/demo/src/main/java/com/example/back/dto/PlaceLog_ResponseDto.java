package com.example.back.dto;

import com.example.back.vo.PlaceLog_vo;

import lombok.Getter;

/**
 * ============================================================
 * PlaceLog_ResponseDto : "동선(방문 기록)" 답장 상자
 * ------------------------------------------------------------
 * [역할]
 *  - 동선 타임라인 화면이 쓰는 모양으로 번역해서 내보낸다.
 * ============================================================
 */
@Getter
public class PlaceLog_ResponseDto {

    /** 동선 기록 번호 (삭제 요청 시 주소에 사용) */
    private Long logId;

    /** 어느 여행의 동선인지 */
    private Long tripId;

    /** 연결된 관광공사 장소 id (자유 입력 기록이면 null) */
    private Long placeId;

    /** 장소명 */
    private String name;

    /** 메모 */
    private String memo;

    /** 연결된 지출 id (없으면 null) — 지출 파트와 이어지는 고리 */
    private Long linkedExpenseId;

    /** 방문 시각 "2026-04-10 14:50:00" */
    private String visitedAt;

    /** GPS 자동 감지 여부 (DB의 0/1을 true/false로 번역한 값) */
    private Boolean detectedByGps;

    /** VO → DTO 변환 공장 */
    public static PlaceLog_ResponseDto from(PlaceLog_vo vo) {
        PlaceLog_ResponseDto dto = new PlaceLog_ResponseDto();
        dto.logId = vo.getId();
        dto.tripId = vo.getTrip_id();
        dto.placeId = vo.getPlace_id();
        dto.name = vo.getName();
        dto.memo = vo.getMemo();
        dto.linkedExpenseId = vo.getLinked_expense_id();
        dto.visitedAt = vo.getVisited_at();
        // 0/1 → false/true 변환 (null이면 false로 처리)
        dto.detectedByGps = vo.getDetected_by_gps() != null && vo.getDetected_by_gps() == 1;
        return dto;
    }
}
