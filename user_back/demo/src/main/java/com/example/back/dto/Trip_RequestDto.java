package com.example.demo.dto;

public class Trip_RequestDto {

    private String name;        // 방 이름 (필수)
    private String emoji;       // 대표 이모지
    private String region;      // 지역 (필수)
    private String startDate;   // "2026-07-15"
    private String endDate;
    private Long budget;        // 예산 (선택 → null 가능)
    private String currency;    // KRW / USD ...

    public Trip_RequestDto() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public Long getBudget() {
        return budget;
    }

    public void setBudget(Long budget) {
        this.budget = budget;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}