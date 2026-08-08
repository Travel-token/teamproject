package com.example.back.vo.place;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** trip_place_logs : 여행 동선(타임라인) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripPlaceLogVo {

    private Long id;
    private Long tripId;
    private Long placeId;
    private String name;
    private String memo;
    private Long linkedExpenseId;
    private LocalDateTime visitedAt;
    private Boolean detectedByGps;
    private LocalDateTime createdAt;
}
