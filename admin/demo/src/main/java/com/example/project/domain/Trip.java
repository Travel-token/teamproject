package com.example.project.domain;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** trips 테이블 매핑 */
@Getter
@Setter
public class Trip {
    private Long id;
    private String name;
    private String region;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long budget;
    private String inviteCode;
    private String status; // planned/ongoing/completed
    private Long createdBy;
    private LocalDateTime createdAt;
}
