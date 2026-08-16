package com.example.back.vo.place;

import com.example.back.vo.enums.PlaceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** places : 장소 (관광공사 API 연동) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceVo {

    private Long id;
    private String externalApiId;
    private String name;
    private PlaceCategory category;
    private String emoji;
    private String description;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String avgCostLabel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
