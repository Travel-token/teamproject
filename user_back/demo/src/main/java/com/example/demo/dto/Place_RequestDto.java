package com.example.demo.dto;

// ============================================================
// Place_RequestDto : 프론트가 보낸 장소 기록 소포
// (trip_id는 소포가 아니라 "주소(/api/trips/3/places)"에서 오므로 여기 없음!)
// ============================================================
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