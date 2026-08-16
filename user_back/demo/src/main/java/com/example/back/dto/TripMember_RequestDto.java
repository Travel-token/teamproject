package com.example.back.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * ============================================================
 * TripMember_RequestDto : "여행에 멤버 추가" 요청 소포
 * ------------------------------------------------------------
 * [역할]
 *  - 명세서 h-2(친구 초대/멤버 추가)에서 사용.
 *  - 가입한 회원이든, 이름만 있는 친구든 모두 이 소포 하나로 처리한다.
 *
 * [tripId가 없는 이유]
 *  - "어느 여행에" 넣을지는 주소(/api/trips/{tripId}/members)에 이미 들어 있다.
 *    → 소포에 또 담으면 주소와 값이 어긋날 수 있어 오히려 위험.
 * ============================================================
 */
@Getter
@Setter
public class TripMember_RequestDto {

    /** 여행 내 표시 이름 (필수). 예: "김민준" */
    private String displayName;

    /** 아바타 색상 키 (tp/tt/ta/tc/tb). 안 보내면 Service가 기본값 tp 사용 */
    private String colorCode;

    /**
     * 가입 회원을 연결할 때만 사용 (users.id).
     * 이름만 초대하는 경우 null → DB에도 NULL로 저장된다.
     */
    private Long userId;
}
