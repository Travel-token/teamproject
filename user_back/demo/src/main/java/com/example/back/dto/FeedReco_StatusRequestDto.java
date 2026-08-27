package com.example.back.dto;

import lombok.Getter;
import lombok.Setter;

/** 추천 처리 결과 반영 요청 (채택/수정/무시) */
@Getter
@Setter
public class FeedReco_StatusRequestDto {

    /** adopted / edited / dismissed */
    private String status;

    /** 채택 후 실제 게시된 피드 글 id (선택) */
    private Long adoptedFeedPostId;
}
