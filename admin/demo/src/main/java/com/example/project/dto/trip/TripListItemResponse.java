package com.example.project.dto.trip;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 목록용 DTO. trips.name에는 이모지가 함께 저장되는 컨벤션이므로(예: "경주 봄 여행 🌸")
 * 별도 emoji 컬럼 없이 name 그대로 내려준다.
 */
@Getter
@Setter
@NoArgsConstructor
public class TripListItemResponse {
    private Long id;
    private String name;
    private int memberCount;
    private String startDate;   // yyyy.MM.dd
    private String endDate;     // yyyy.MM.dd
    private int tripDays;
    private long totalAmount;
    private String status;      // live / settle / done
    private String createdAt;   // yyyy.MM.dd
}
