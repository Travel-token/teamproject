package com.example.demo.dto;

import com.example.demo.vo.Trip_vo;


public class Trip_ResponseDto {

    private Long tripId;
    private String name;
    private String emoji;
    private String region;
    private String startDate;
    private String endDate;
    private Long budget;
    private String currency;
    private String status;
    private String createdAt;

    public Trip_ResponseDto() {
    }

    // Trip_vo → Trip_ResponseDto 로 옮겨 담는 공장 메서드
    public static Trip_ResponseDto from(Trip_vo vo) {
        Trip_ResponseDto dto = new Trip_ResponseDto();
        dto.tripId = vo.getTrip_id();
        dto.name = vo.getName();
        dto.emoji = vo.getEmoji();
        dto.region = vo.getRegion();
        dto.startDate = vo.getStart_date();
        dto.endDate = vo.getEnd_date();
        dto.budget = vo.getBudget();
        dto.currency = vo.getCurrency();
        dto.status = vo.getStatus();
        dto.createdAt = vo.getCreated_at();
        return dto;
    }

    public Long getTripId() {
        return tripId;
    }

    public String getName() {
        return name;
    }

    public String getEmoji() {
        return emoji;
    }

    public String getRegion() {
        return region;
    }

    public String getStartDate() {
        return startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public Long getBudget() {
        return budget;
    }

    public String getCurrency() {
        return currency;
    }

    public String getStatus() {
        return status;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}