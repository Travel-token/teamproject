package com.example.project.dto.trip;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TripBasicRow {
    private Long id;
    private String name;
    private String startDate;
    private String endDate;
    private int tripDays;
    private String createdAt;
    private int memberCount;
    private long totalAmount;
    private String status;
}
