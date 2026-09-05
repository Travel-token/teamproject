package com.example.back.dto;

import java.time.LocalDateTime;

import com.example.back.vo.TripPhotoVo;

import lombok.Builder;
import lombok.Getter;

// 여행 사진 응답
@Getter
@Builder
public class TripPhotoResponse {
    private Long id;
    private String imageUrl;
    private LocalDateTime createdAt;

    public static TripPhotoResponse from(TripPhotoVo photo) {
        return TripPhotoResponse.builder()
                .id(photo.getId())
                .imageUrl(photo.getImageUrl())
                .createdAt(photo.getCreatedAt())
                .build();
    }
}