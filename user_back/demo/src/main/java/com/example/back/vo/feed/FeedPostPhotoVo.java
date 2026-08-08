package com.example.back.vo.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** feed_post_photos : 피드 게시물 사진 (최대 5장) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedPostPhotoVo {

    private Long id;
    private Long feedPostId;
    private String photoUrl;
    private Integer sortOrder;
}
