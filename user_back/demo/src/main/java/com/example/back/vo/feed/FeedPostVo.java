package com.example.back.vo.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** feed_posts : SNS 피드 게시물 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedPostVo {

    private Long id;
    private Long placeId;
    private Long authorId;
    private String caption;
    private BigDecimal distanceKm;
    private Integer likesCount;
    private Integer viewsCount;
    private Integer commentsCount;
    private LocalDateTime createdAt;
}
