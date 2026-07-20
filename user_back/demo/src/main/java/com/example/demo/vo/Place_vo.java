package com.example.demo.vo;

// ============================================================
// Place_vo : place 테이블 한 줄을 담는 상자 (컬럼명과 동일한 snake_case)
// ============================================================
public class Place_vo {

    private Long place_id;
    private Long trip_id;      // 부모 여행방 번호 (FK)
    private String name;
    private String visit_time;
    private String memo;
    private String created_at;

    public Place_vo() {
    }

    public Long getPlace_id() {
        return place_id;
    }

    public void setPlace_id(Long place_id) {
        this.place_id = place_id;
    }

    public Long getTrip_id() {
        return trip_id;
    }

    public void setTrip_id(Long trip_id) {
        this.trip_id = trip_id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVisit_time() {
        return visit_time;
    }

    public void setVisit_time(String visit_time) {
        this.visit_time = visit_time;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }

    public String getCreated_at() {
        return created_at;
    }

    public void setCreated_at(String created_at) {
        this.created_at = created_at;
    }
}