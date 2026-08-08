package com.example.back.vo.trip;

import com.example.back.vo.enums.MemberRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** trip_members : 여행 참여 멤버 (정산/지출 기준 단위) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripMemberVo {

    private Long id;
    private Long tripId;
    private Long userId;
    private String displayName;
    private String shortName;
    private String colorCode;
    private MemberRole role;
    private LocalDateTime joinedAt;
}
