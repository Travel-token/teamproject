package com.example.back.vo.recommendation;

import com.example.back.vo.enums.RecommendationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * feed_recommendations : 정산 완료 기반 LLM 피드 추천.
 * llmRequest/llmResponse는 JSON 컬럼으로, 여기서는 원본 문자열(String)로 매핑한다.
 * 필요 시 서비스 계층에서 Jackson으로 파싱해서 사용한다.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedRecommendationVo {

    private Long id;
    private Long settlementId;
    private Long tripId;
    private Long placeId;
    private Long targetUserId;
    private String suggestedCaption;
    private RecommendationStatus status;
    private Long adoptedFeedPostId;
    private String llmProvider;
    private String llmModel;
    private String llmRequest;
    private String llmResponse;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}
