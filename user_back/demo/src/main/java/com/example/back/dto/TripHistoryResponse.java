package com.example.back.dto;

import com.example.back.vo.enums.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/** GET /users/me/history 응답 : 내가 참여한 여행 + 해당 여행 총 지출 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripHistoryResponse {

    private Long tripId;
    private String currency;
    private java.util.List<String> photoUrls;
    private String name;
    private String region;
    private LocalDate startDate;
    private LocalDate endDate;
    private TripStatus status;
    private BigDecimal totalExpenseAmount;
}
