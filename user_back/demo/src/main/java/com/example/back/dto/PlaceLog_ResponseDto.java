package com.example.back.dto;

import com.example.back.vo.PlaceLog_vo;
import lombok.Getter;

// ============================================================
// PlaceLog_ResponseDto : 동선 답장 상자
// ============================================================
@Getter
public class PlaceLog_ResponseDto {

    private Long logId;
    private Long tripId;
    private Long placeId;
    private String name;
    private String memo;
    private Long linkedExpenseId;
    private String visitedAt;
    private Boolean detectedByGps;

    public PlaceLog_ResponseDto() {
    }

    public static PlaceLog_ResponseDto from(PlaceLog_vo vo) {
        PlaceLog_ResponseDto dto = new PlaceLog_ResponseDto();
        dto.logId = vo.getId();
        dto.tripId = vo.getTrip_id();
        dto.placeId = vo.getPlace_id();
        dto.name = vo.getName();
        dto.memo = vo.getMemo();
        dto.linkedExpenseId = vo.getLinked_expense_id();
        dto.visitedAt = vo.getVisited_at();
        dto.detectedByGps = vo.getDetected_by_gps() != null && vo.getDetected_by_gps() == 1;
        return dto;
    }

}
