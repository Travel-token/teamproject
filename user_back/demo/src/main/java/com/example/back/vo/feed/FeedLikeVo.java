package com.example.back.vo.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** feed_likes : 피드 좋아요 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedLikeVo {

    private Long id;
    private Long feedPostId;
    private Long userId;
    private LocalDateTime createdAt;
}
