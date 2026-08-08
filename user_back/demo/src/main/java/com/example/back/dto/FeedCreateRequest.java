package com.example.back.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/** 피드 생성 요청 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeedCreateRequest {

    private Long placeId;
    private String caption;
    private List<String> photoUrls;
}
