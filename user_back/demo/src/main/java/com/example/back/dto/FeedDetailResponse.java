package com.example.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** 내 피드 목록/상세 조회 응답 (feed_posts + feed_post_photos 조합) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedDetailResponse {

    private Long id;
    private Long placeId;
    private String caption;
    private BigDecimal distanceKm;
    private Integer likesCount;
    private Integer viewsCount;
    private Integer commentsCount;
    private LocalDateTime createdAt;
    private List<String> photoUrls;
}
