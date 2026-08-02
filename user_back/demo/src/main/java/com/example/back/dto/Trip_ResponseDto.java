package com.example.back.dto;

import com.example.back.vo.Trip_vo;

// ============================================================
// Trip_ResponseDto : 여행 답장 상자 (snake→camel 번역 담당)
// ============================================================
public class Trip_ResponseDto {

    private Long tripId;
    private String name;
    private String region;
    private String startDate;
    private String endDate;
    private Long budget;
    private String inviteCode;
    private String status;
    private Long createdBy;
    private String createdAt;

    public Trip_ResponseDto() {
    }

    public static Trip_ResponseDto from(Trip_vo vo) {
        Trip_ResponseDto dto = new Trip_ResponseDto();
        dto.tripId = vo.getId();
        dto.name = vo.getName();
        dto.region = vo.getRegion();
        dto.startDate = vo.getStart_date();
        dto.endDate = vo.getEnd_date();
        dto.budget = vo.getBudget();
        dto.inviteCode = vo.getInvite_code();
        dto.status = vo.getStatus();
        dto.createdBy = vo.getCreated_by();
        dto.createdAt = vo.getCreated_at();
        return dto;
    }

    public Long getTripId() { return tripId; }
    public String getName() { return name; }
    public String getRegion() { return region; }
    public String getStartDate() { return startDate; }
    public String getEndDate() { return endDate; }
    public Long getBudget() { return budget; }
    public String getInviteCode() { return inviteCode; }
    public String getStatus() { return status; }
    public Long getCreatedBy() { return createdBy; }
    public String getCreatedAt() { return createdAt; }
}
