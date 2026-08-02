package com.example.back.dto;

import lombok.Getter;
import lombok.Setter;

// ============================================================
// TripMember_RequestDto : "이름만으로 멤버 추가" 소포 (h-2)
// ============================================================
@Setter
@Getter
public class TripMember_RequestDto {

    private String displayName;  // 필수 (예: 김민준)
    private String colorCode;    // 선택 (tp/tt/ta/tc/tb, 없으면 서버가 tp)
    private Long userId;         // 가입 회원 연결용 (로그인 연동 전엔 null)

    public TripMember_RequestDto() {
    }

}
