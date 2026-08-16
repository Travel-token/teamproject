package com.example.back.vo.expense;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** expense_categories : 지출 카테고리 (PK = code) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategoryVo {

    private String code;
    private String label;
    private String colorVar;
    private Integer sortOrder;
}
