package com.example.back.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 피드 수정 요청.
 * photoUrls가 null이면 사진은 그대로 유지, 값이 오면(빈 리스트 포함) 기존 사진을 전부 교체한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeedUpdateRequest {

    private String caption;
    private List<String> photoUrls;
}
