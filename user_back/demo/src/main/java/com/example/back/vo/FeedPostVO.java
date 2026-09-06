package com.example.back.vo;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FeedPostVO {

    private String authorName;
    private String authorProfileImageUrl;
    private boolean likedByMe;
    private java.util.List<String> photoUrls;
    private Long id;
    private Long userId;
    private Long placeId;
    private String caption;
    private Long viewCount;
    private Long likeCount;
    private Long commentCount;
    private Double popularityScore;
    private LocalDateTime createdAt;

    // place 조인 결과 (목록/상세 조회 시 채워짐) / 피드 생성 요청 시에는 place 지정용으로 사용
    private String apiContentId;
    private String placeName;
    private String addr;
    private String category;
    private Double lat;
    private Double lng;
    private String thumbnailUrl;

    // 거리순 정렬(sort=distance) 시에만 채워짐, km 단위
    private Double distanceKm;
}
