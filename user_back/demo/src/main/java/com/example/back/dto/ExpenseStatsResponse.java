package com.example.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

/** GET /users/me/history/stats 응답 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseStatsResponse {

    private BigDecimal totalAmount;
    private Integer placeCount;
    private java.util.Map<String,BigDecimal> totalsByCurrency;
    private List<CategoryExpenseStat> categoryStats;
}
