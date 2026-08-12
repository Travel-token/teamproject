package com.example.back.dto;

import com.example.back.vo.Trip_vo;

import lombok.Getter;

/**
 * ============================================================
 * Trip_ResponseDto : 서버가 프론트로 돌려주는 "여행" 답장 상자
 * ============================================================
 */
@Getter
public class Trip_ResponseDto {

    /** 여행 번호 (VO의 id → 프론트에서는 tripId로 사용) */
    private Long tripId;

    /** 여행 이름 */
    private String name;

    /** 지역 */
    private String region;

    /** 시작일 "2026-04-10" */
    private String startDate;

    /** 종료일 */
    private String endDate;

    /** 예산(원) */
    private Long budget;

    /** 초대 코드 — 초대 화면에서 그대로 보여준다 */
    private String inviteCode;

    /** 상태: planned / ongoing / completed */
    private String status;

    /** 생성자 회원 id */
    private Long createdBy;

    /** 생성 시각 */
    private String createdAt;

    /**
     * VO(창고 상자) → DTO(답장 상자) 변환 공장.
     * 여기서 snake_case 필드를 camelCase 필드로 옮겨 담는다.
     */
    public static Trip_ResponseDto from(Trip_vo vo) {
        Trip_ResponseDto dto = new Trip_ResponseDto();
        dto.tripId = vo.getId();
        dto.name = vo.getName();
        dto.region = vo.getRegion();
        dto.startDate = vo.getStart_date();
        dto.endDate = vo.getEnd_date();
        dto.budget = vo.getBudget();
        dto.inviteCode = vo.getInvite_code();
        dto.status = vo.getStatus();
        dto.createdBy = vo.getCreated_by();
        dto.createdAt = vo.getCreated_at();
        return dto;
    }
}
