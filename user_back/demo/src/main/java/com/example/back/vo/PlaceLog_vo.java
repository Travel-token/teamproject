package com.example.back.vo;

// ============================================================
// PlaceLog_vo : trip_place_logs(여행 동선 타임라인) 한 줄 상자
// 옛 place 테이블의 후계자. 달라진 점:
//  - visit_time(문자열) → visited_at(DATETIME, 필수)
//  - 좌표는 여기 없음 (places 마스터 테이블이 보유, place_id로 연결)
//  - linked_expense_id: 지출과 연결 (권소희 파트와의 연결 고리!)
// ============================================================
public class PlaceLog_vo {

    private Long id;
    private Long trip_id;
    private Long place_id;           // 관광공사 장소면 연결, 자유 입력이면 NULL
    private String name;             // 동선 표시명 (필수)
    private String memo;
    private Long linked_expense_id;  // 함께 등록된 지출 (없으면 NULL)
    private String visited_at;       // "2026-05-05 14:00:00" (필수)
    private Integer detected_by_gps; // GPS 자동 감지 여부 (0/1)
    private String created_at;

    public PlaceLog_vo() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTrip_id() { return trip_id; }
    public void setTrip_id(Long trip_id) { this.trip_id = trip_id; }
    public Long getPlace_id() { return place_id; }
    public void setPlace_id(Long place_id) { this.place_id = place_id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMemo() { return memo; }
    public void setMemo(String memo) { this.memo = memo; }
    public Long getLinked_expense_id() { return linked_expense_id; }
    public void setLinked_expense_id(Long linked_expense_id) { this.linked_expense_id = linked_expense_id; }
    public String getVisited_at() { return visited_at; }
    public void setVisited_at(String visited_at) { this.visited_at = visited_at; }
    public Integer getDetected_by_gps() { return detected_by_gps; }
    public void setDetected_by_gps(Integer detected_by_gps) { this.detected_by_gps = detected_by_gps; }
    public String getCreated_at() { return created_at; }
    public void setCreated_at(String created_at) { this.created_at = created_at; }
}
