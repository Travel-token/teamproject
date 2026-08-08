package com.example.back.vo.trip;

import com.example.back.vo.enums.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** trips : 여행 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripVo {

    private Long id;
    private String name;
    private String region;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
    private String inviteCode;
    private TripStatus status;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
