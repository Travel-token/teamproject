package com.example.back.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * ============================================================
 * Trip_RequestDto : 프론트가 서버로 보내는 "여행 생성/수정" 소포
 * ------------------------------------------------------------
 * [역할]
 *  - 앱이 보낸 JSON을 Spring이 이 상자에 자동으로 담아준다(@RequestBody).
 *  - 변수명을 JSON 키와 똑같이 camelCase로 맞추는 것이 핵심.
 *
 * [여기에 일부러 없는 것들 — 설계 의도]
 *  - inviteCode : 서버가 자동 발급한다. 클라이언트가 정하면 중복/조작 위험.
 *  - status     : 서버가 결정한다(생성 시 ongoing).
 *  → "서버가 정할 값은 소포에 담지 않는다"가 원칙.
 *
 * ============================================================
 */
@Getter
@Setter
public class Trip_RequestDto {

    /** 여행 이름 (필수). 비어 있으면 Service의 문지기가 400으로 거절 */
    private String name;

    /** 여행 지역 (필수) */
    private String region;

    /** 시작일 "yyyy-MM-dd" (필수). 형식이 틀리면 400 */
    private String startDate;

    /** 종료일 "yyyy-MM-dd" (필수). 시작일보다 빠르면 400 */
    private String endDate;

    /** 예산(원). 선택 항목이라 없으면 null 그대로 저장 */
    private Long budget;

    /**
     * 생성자 회원 id.
     * 로그인 기능이 붙기 전까지는 비워 보내도 되며,
     * 그 경우 Service가 시드 회원 1번으로 대체한다.
     * TODO(로그인 연동): 세션에서 꺼낸 회원 id로 대체 예정
     */
    private Long createdBy;

    /**
     * 생성자 표시 이름 (선택).
     * 방을 만들 때 이 이름으로 owner 멤버가 자동 등록된다.
     * 비워 보내면 "방장"으로 들어간다.
     */
    private String creatorName;
}
