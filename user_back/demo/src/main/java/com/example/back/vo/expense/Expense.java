package com.example.back.vo.expense;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** expenses 테이블 매핑 */
@Getter
@Setter
public class Expense {
    private Long id;
    private Long tripId;
    private String name;
    private String emoji;
    private BigDecimal amount;
    private LocalDateTime spentAt;
    private String categoryCode; // meal/ticket/cafe/shop/trans
    private String source; // ocr/manual/card_sync
    private String receiptImageUrl;
    private Long payerMemberId;
    private String payerName;
    private String splitMode; // even/manual/percent
    private String memo;
    private String ocrConfidence; // JSON
    private LocalDateTime createdAt;
}
