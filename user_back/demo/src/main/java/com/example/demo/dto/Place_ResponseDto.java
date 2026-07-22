package com.example.demo.dto;

import com.example.demo.vo.Place_vo;

public class Place_ResponseDto {

    private Long placeId;
    private Long tripId;
    private String name;
    private String visitTime;
    private String memo;
    private String createdAt;

    public Place_ResponseDto() {
    }

    public static Place_ResponseDto from(Place_vo vo) {
        Place_ResponseDto dto = new Place_ResponseDto();
        dto.placeId = vo.getPlace_id();
        dto.tripId = vo.getTrip_id();
        dto.name = vo.getName();
        dto.visitTime = vo.getVisit_time();
        dto.memo = vo.getMemo();
        dto.createdAt = vo.getCreated_at();
        return dto;
    }

    public Long getPlaceId() {
        return placeId;
    }

    public Long getTripId() {
        return tripId;
    }

    public String getName() {
        return name;
    }

    public String getVisitTime() {
        return visitTime;
    }

    public String getMemo() {
        return memo;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}