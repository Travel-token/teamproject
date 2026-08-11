package com.example.back.dto;

import com.example.back.vo.Trip_vo;

import lombok.Getter;

/**
 * ============================================================
 * Trip_ResponseDto : 서버가 프론트로 돌려주는 "여행" 답장 상자
 * ------------------------------------------------------------
 * [역할 = 번역기]
 *  - DB 말투(snake_case: start_date)를 프론트 말투(camelCase: startDate)로 바꾼다.
 *  - 내보내도 되는 값만 골라 담는다(불필요한 내부 정보 차단).
 *
 * [from() 정적 메서드]
 *  - "VO를 넣으면 DTO를 만들어 주는 공장".
 *  - static이라 객체를 만들지 않고 Trip_ResponseDto.from(vo)로 바로 호출한다.
 *  - 같은 클래스 안이므로 setter 없이 필드에 직접 값을 넣을 수 있다.
 *
 * [lombok을 @Getter만 붙인 이유]
 *  - 이 상자는 "내보내기 전용"이다.
 *  - JSON으로 변환할 때 Jackson이 getter를 읽어 키 이름을 정하므로 @Getter는 필수.
 *  - 반대로 외부에서 값을 바꿀 일은 없으므로 @Setter는 일부러 붙이지 않는다.
 *    (실수로 답장 내용이 바뀌는 것을 막는 안전장치)
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
