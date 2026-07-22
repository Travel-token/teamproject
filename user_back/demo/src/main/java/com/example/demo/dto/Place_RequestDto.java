package com.example.demo.dto;

public class Place_RequestDto {

    private String name;       // 장소명 (필수)
    private String visitTime;  // "14:00"
    private String memo;

    public Place_RequestDto() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVisitTime() {
        return visitTime;
    }

    public void setVisitTime(String visitTime) {
        this.visitTime = visitTime;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }
}