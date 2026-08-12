package com.example.back.vo.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** feed_comments : 피드 댓글 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedCommentVo {

    private Long id;
    private Long feedPostId;
    private Long userId;
    private String content;
    private LocalDateTime createdAt;
}
