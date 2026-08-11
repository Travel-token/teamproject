package com.example.back.vo.expense;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/** split_details 테이블 매핑 */
@Getter
@Setter
public class SplitDetail {
    private Long id;
    private Long expenseId;
    private String memberName;
    private BigDecimal amount; // manual 모드
    private BigDecimal percent; // percent 모드
}
