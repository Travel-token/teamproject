package com.example.back.vo;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

// 여행 사진
@Getter
@Setter
public class TripPhotoVo {
    private Long id;
    private Long tripId;
    private String imageUrl;
    private LocalDateTime createdAt;
}