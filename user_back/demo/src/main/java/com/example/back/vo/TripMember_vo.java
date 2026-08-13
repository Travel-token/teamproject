package com.example.back.vo;

import lombok.Getter;
import lombok.Setter;

/**
 * ============================================================
 * TripMember_vo : trip_members 테이블의 "한 줄" 상자
 * ------------------------------------------------------------
 * [역할]
 *  - 여행에 참여한 멤버 1명. 정산과 지출의 기준 단위가 되는 존재.
 *
 * [이 테이블의 핵심 설계]
 *  - user_id가 NULL을 허용한다.
 *    → 앱에 가입하지 않은 친구도 "이름만" 적어서 멤버로 넣을 수 있다는 뜻.
 *      (시드 데이터의 "최미정(총무)"가 이 경우 — userId가 null로 나온다)
 *  - 그래서 화면에 보여줄 이름은 users 테이블이 아니라
 *    이 테이블의 display_name을 쓴다.
 * ============================================================
 */
@Getter
@Setter
public class TripMember_vo {

    /** PK. trip_members.id */
    private Long id;

    /** 어느 여행 소속인지 (trips FK). 여행이 삭제되면 CASCADE로 함께 삭제됨 */
    private Long trip_id;

    /** 가입 회원이면 users.id 연결, 이름만 초대된 멤버면 NULL */
    private Long user_id;

    /** 여행 내 표시 이름 (필수). 예: "박찬민" */
    private String display_name;

    /** 아바타 원에 넣을 축약 이름. Service가 display_name 앞 2글자로 만든다. 예: "박찬" */
    private String short_name;

    /** 아바타 색상 키 (tp/tt/ta/tc/tb). 화면 테마 컬러 변수와 짝을 이룬다 */
    private String color_code;

    /** 역할: owner(방장) / member(일반). 방을 만든 사람이 자동으로 owner가 된다 */
    private String role;

    /** 참여 시각 (DB 자동 기록) */
    private String joined_at;
}
