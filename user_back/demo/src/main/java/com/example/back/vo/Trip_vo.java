package com.example.back.vo;

import lombok.Getter;
import lombok.Setter;

/**
 * ============================================================
 * Trip_vo : trips 테이블의 "한 줄"을 담는 상자 (Value Object)
 * ------------------------------------------------------------
 * [역할]
 *  - DB의 trips 테이블과 1:1로 대응하는 그릇.
 *  - MyBatis가 SELECT 결과를 이 상자에 자동으로 담고,
 *    INSERT/UPDATE 시에는 이 상자에서 값을 꺼내 SQL의 #{...}에 넣는다.
 *
 * [이름 규칙 주의]
 *  - 변수명을 DB 컬럼명(snake_case)과 똑같이 맞춘다.
 *    → MyBatis가 "컬럼명 = 변수명"으로 자동 매핑하기 때문.
 *    → 프론트에 나갈 때 쓰는 camelCase 변환은 DTO가 담당한다.
 *
 * [lombok]
 *  - @Getter : 모든 필드의 getXxx() 메서드를 컴파일 시 자동 생성
 *  - @Setter : 모든 필드의 setXxx() 메서드를 컴파일 시 자동 생성
 *    → MyBatis는 setter로 값을 채우고, DTO 변환 시에는 getter로 값을 꺼내므로 둘 다 필요.
 *    → 기본 생성자(new Trip_vo())는 다른 생성자를 만들지 않으면 자바가 자동 제공한다.
 * ============================================================
 */
@Getter
@Setter
public class Trip_vo {

    /** PK. trips.id (AUTO_INCREMENT) — INSERT 후 MyBatis가 발급된 번호를 여기에 되돌려 채운다 */
    private Long id;

    /** 여행 이름 (필수). 예: "경주 봄 여행 🌸" */
    private String name;

    /** 지역. 예: "경주" */
    private String region;

    /** 여행 시작일 "2026-04-10" (DB 타입 DATE ↔ 문자열로 주고받음) */
    private String start_date;

    /** 여행 종료일 "2026-04-12" */
    private String end_date;

    /** 예산(원). 스키마상 NULL 허용이라 기본형 long이 아닌 Long 사용 */
    private Long budget;

    /** 초대 코드 (UNIQUE). 사용자가 정하지 않고 Service가 자동 발급한다. 예: "TT-A3K9PQ" */
    private String invite_code;

    /** 여행 상태: planned(예정) / ongoing(진행중) / completed(종료) */
    private String status;

    /** 생성자 회원 id (users FK). 로그인 연동 전에는 Service에서 임시로 1L을 넣는다 */
    private Long created_by;

    /** 생성 시각 (DB가 자동 기록) */
    private String created_at;

    /** 수정 시각 (DB가 UPDATE 때마다 자동 갱신) */
    private String updated_at;
}
