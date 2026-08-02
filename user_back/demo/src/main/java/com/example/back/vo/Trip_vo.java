package com.example.back.vo;

// ============================================================
// Trip_vo : trips 테이블 한 줄 상자 (공식 스키마 1:1)
// 변수명 = 컬럼명(snake_case) → MyBatis 자동 매핑
// ============================================================
public class Trip_vo {

    private Long id;              // PK (옛 trip_id → 공식은 id)
    private String name;          // 여행 이름 (필수)
    private String region;        // 지역
    private String start_date;    // "2026-05-05"
    private String end_date;
    private Long budget;          // 예산(원)
    private String invite_code;   // 초대 코드 (서버가 자동 발급, UNIQUE)
    private String status;        // planned / ongoing / completed
    private Long created_by;      // 생성자 회원 id (users FK)
    private String created_at;
    private String updated_at;

    public Trip_vo() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getStart_date() { return start_date; }
    public void setStart_date(String start_date) { this.start_date = start_date; }
    public String getEnd_date() { return end_date; }
    public void setEnd_date(String end_date) { this.end_date = end_date; }
    public Long getBudget() { return budget; }
    public void setBudget(Long budget) { this.budget = budget; }
    public String getInvite_code() { return invite_code; }
    public void setInvite_code(String invite_code) { this.invite_code = invite_code; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getCreated_by() { return created_by; }
    public void setCreated_by(Long created_by) { this.created_by = created_by; }
    public String getCreated_at() { return created_at; }
    public void setCreated_at(String created_at) { this.created_at = created_at; }
    public String getUpdated_at() { return updated_at; }
    public void setUpdated_at(String updated_at) { this.updated_at = updated_at; }
}
