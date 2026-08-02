package com.example.back.dto;

import com.example.back.vo.TripMember_vo;
import lombok.Getter;

// ============================================================
// TripMember_ResponseDto : 멤버 답장 상자
// ============================================================
@Getter
public class TripMember_ResponseDto {

    private Long memberId;
    private Long tripId;
    private Long userId;
    private String displayName;
    private String shortName;
    private String colorCode;
    private String role;

    public TripMember_ResponseDto() {
    }

    public static TripMember_ResponseDto from(TripMember_vo vo) {
        TripMember_ResponseDto dto = new TripMember_ResponseDto();
        dto.memberId = vo.getId();
        dto.tripId = vo.getTrip_id();
        dto.userId = vo.getUser_id();
        dto.displayName = vo.getDisplay_name();
        dto.shortName = vo.getShort_name();
        dto.colorCode = vo.getColor_code();
        dto.role = vo.getRole();
        return dto;
    }

}
