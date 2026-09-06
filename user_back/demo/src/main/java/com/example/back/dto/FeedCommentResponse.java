package com.example.back.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FeedCommentResponse {
    private Long id;
    private String authorName;
    private String content;
}