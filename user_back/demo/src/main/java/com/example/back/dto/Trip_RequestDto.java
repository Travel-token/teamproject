package com.example.back.dto;

// ============================================================
// Trip_RequestDto : 프론트의 방 만들기/수정 소포
// invite_code, status는 여기 없음 → 서버가 정하는 값이라서!
// ============================================================
public class Trip_RequestDto {

    private String name;         // 필수
    private String region;       // 필수(명세서 기준)
    private String startDate;    // "2026-05-05" 필수
    private String endDate;      // 필수
    private Long budget;         // 선택
    private Long createdBy;      // 생성자 회원 id. 로그인 연동 전엔 비워도 됨(서버가 1번 처리)
    private String creatorName;  // 생성자 표시 이름 (owner 멤버 자동 등록용, 선택)

    public Trip_RequestDto() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public Long getBudget() { return budget; }
    public void setBudget(Long budget) { this.budget = budget; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
}
