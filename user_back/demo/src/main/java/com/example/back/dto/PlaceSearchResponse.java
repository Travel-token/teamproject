package com.example.back.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

// 장소 검색
@Getter
@Setter
public class PlaceSearchResponse {
    private Long id;
    private String name;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // DB 스키마에 썸네일 컬럼이 없으므로 null 반환
    private String thumbnailUrl;
}