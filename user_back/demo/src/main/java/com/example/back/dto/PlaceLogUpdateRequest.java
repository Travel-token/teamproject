package com.example.back.dto;

import lombok.Getter;
import lombok.Setter;

// 동선 수정
@Getter
@Setter
public class PlaceLogUpdateRequest {
    private String name;
    private String memo;
    private String visitedAt;
    private Long placeId;
    private Boolean detectedByGps;
}