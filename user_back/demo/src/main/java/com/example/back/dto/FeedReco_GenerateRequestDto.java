package com.example.back.dto;

import lombok.Getter;
import lombok.Setter;

/** 추천 생성 요청. 정산 완료 시점에 호출된다. */
@Getter
@Setter
public class FeedReco_GenerateRequestDto {

    /** 추천 근거가 되는 정산 세션 (필수) */
    private Long settlementId;

    /** 추천 대상 사용자. 미지정 시 서버에서 기본값 처리 (로그인 연동 후 세션값으로 대체) */
    private Long targetUserId;
}
