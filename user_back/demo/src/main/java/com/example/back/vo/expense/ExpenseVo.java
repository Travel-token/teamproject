package com.example.back.vo.expense;

import com.example.back.vo.enums.ExpenseSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** expenses : 지출 내역 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseVo {

    private Long id;
    private Long tripId;
    private String categoryCode;
    private Long payerMemberId;
    private String name;
    private String memo;
    private BigDecimal amount;
    private ExpenseSource source;
    private String receiptImageUrl;
    private LocalDateTime spentAt;
    private LocalDateTime createdAt;
}
