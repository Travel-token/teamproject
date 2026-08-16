package com.example.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** 카테고리별 지출 합계 (expenses + expense_categories 조인 결과) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryExpenseStat {

    private String categoryCode;
    private String categoryLabel;
    private BigDecimal amount;
}
