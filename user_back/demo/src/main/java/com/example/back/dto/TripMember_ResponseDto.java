package com.example.back.dto;

import com.example.back.vo.TripMember_vo;

import lombok.Getter;

/**
 * ============================================================
 * TripMember_ResponseDto : "멤버" 답장 상자
 * ------------------------------------------------------------
 * [역할]
 *  - 멤버 목록 화면(아바타 + 이름)에 필요한 값만 골라 camelCase로 번역해 전달.
 *  - joined_at 같은 화면에서 안 쓰는 값은 일부러 담지 않는다
 *    → 답장이 가벼워지고, 불필요한 내부 정보가 밖으로 나가지 않는다.
 * ============================================================
 */
@Getter
public class TripMember_ResponseDto {

    /** 멤버 번호 (강퇴/삭제 요청 시 이 번호를 주소에 사용) */
    private Long memberId;

    /** 어느 여행 소속인지 */
    private Long tripId;

    /** 연결된 회원 id. 미가입 멤버는 null로 그대로 전달된다 */
    private Long userId;

    /** 표시 이름. 예: "최미정(총무)" */
    private String displayName;

    /** 아바타 축약 이름. 예: "최미" */
    private String shortName;

    /** 아바타 색상 키 (tp/tt/ta/tc/tb) */
    private String colorCode;

    /** owner(방장) / member */
    private String role;

    /** VO → DTO 변환 공장 */
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
