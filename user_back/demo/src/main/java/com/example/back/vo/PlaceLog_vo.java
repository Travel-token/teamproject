package com.example.back.vo;

import lombok.Getter;
import lombok.Setter;

/**
 * ============================================================
 * PlaceLog_vo : trip_place_logs 테이블의 "한 줄" 상자
 * ------------------------------------------------------------
 * [역할]
 *  - 여행 중 "언제 어디를 방문했는지" 한 건. 이것들이 모여 동선(타임라인)이 된다.
 *
 * [옛 place 테이블에서 달라진 점 3가지]
 *  1) visit_time(문자열) → visited_at(DATETIME, 필수)
 *     → 진짜 시각이라 날짜를 넘겨도 정확한 순서로 정렬된다.
 *  2) 좌표(위경도)가 여기 없다.
 *     → 관광공사 장소 정보는 별도 places 테이블이 보유하고,
 *       place_id로 연결만 한다. (같은 정보를 두 곳에 중복 저장하지 않기 위함)
 *  3) linked_expense_id 추가
 *     → "이 장소에서 쓴 지출"과 이어주는 고리. (지출 파트와의 연결점)
 * ============================================================
 */
@Getter
@Setter
public class PlaceLog_vo {

    /** PK. trip_place_logs.id */
    private Long id;

    /** 어느 여행의 동선인지 (trips FK). 여행 삭제 시 CASCADE로 함께 삭제 */
    private Long trip_id;

    /** 관광공사 등록 장소면 places.id 연결, 사용자가 직접 입력한 장소면 NULL */
    private Long place_id;

    /** 동선에 표시할 이름 (필수). 예: "불국사 탐방" */
    private String name;

    /** 메모. 예: "겹벚꽃이 예쁘게 피었음" */
    private String memo;

    /** 함께 등록된 지출의 id (없으면 NULL) */
    private Long linked_expense_id;

    /** 방문 시각 "2026-04-10 14:50:00" (필수). 동선 정렬의 기준 */
    private String visited_at;

    /**
     * GPS 자동 감지로 추가된 기록인지 여부.
     * DB는 TINYINT(1)이라 0/1로 저장되므로 자바에서는 Integer로 받는다.
     * (true/false 변환은 ResponseDto가 담당)
     */
    private Integer detected_by_gps;

    /** 기록 생성 시각 (DB 자동) */
    // places 조인 - 지도 표시용
    private Double latitude;
    private Double longitude;
    private String place_emoji;

    private String created_at;
}