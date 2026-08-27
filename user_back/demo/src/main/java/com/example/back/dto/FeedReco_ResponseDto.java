package com.example.back.dto;

import com.example.back.vo.recommendation.FeedRecommendationVo;

import lombok.Getter;

/**
 * AI 피드 추천 응답 DTO.
 * llm_request/llm_response 등 내부 디버깅용 컬럼은 노출하지 않는다.
 */
@Getter
public class FeedReco_ResponseDto {

    private Long recommendationId;
    private Long settlementId;
    private Long tripId;
    private Long placeId;
    private Long targetUserId;
    private String suggestedCaption;
    private String status;
    private Long adoptedFeedPostId;
    private String createdAt;

    public static FeedReco_ResponseDto from(FeedRecommendationVo vo) {
        FeedReco_ResponseDto dto = new FeedReco_ResponseDto();
        dto.recommendationId = vo.getId();
        dto.settlementId = vo.getSettlementId();
        dto.tripId = vo.getTripId();
        dto.placeId = vo.getPlaceId();
        dto.targetUserId = vo.getTargetUserId();
        dto.suggestedCaption = vo.getSuggestedCaption();
        dto.status = vo.getStatus() == null ? null : vo.getStatus().getCode();
        dto.adoptedFeedPostId = vo.getAdoptedFeedPostId();
        dto.createdAt = vo.getCreatedAt() == null ? null : vo.getCreatedAt().toString();
        return dto;
    }
}
