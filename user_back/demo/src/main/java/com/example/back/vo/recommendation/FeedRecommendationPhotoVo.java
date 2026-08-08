package com.example.back.vo.recommendation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** feed_recommendation_photos : 피드 추천 초안 첨부 사진 후보 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedRecommendationPhotoVo {

    private Long id;
    private Long recommendationId;
    private String photoUrl;
    private Integer sortOrder;
}
