package com.example.back.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

public class ExpenseResponse {

    @Getter
    @Builder
    public static class Item {
        private Long id;
        private Long payerMemberId;
        private String categoryCode;
        private String splitMode;
        private java.time.LocalDateTime spentAt;
        private java.util.List<ExpenseRequest.SplitInput> splits;
        private String dateLabel;
        private String emoji;
        private String name;
        private String payerName;
        private String splitLabel; // "3명 균등" / "직접입력" / "퍼센트"
        private BigDecimal amount;
        private BigDecimal myShare;
        private String memo;
    }

    @Getter
    @Builder
    public static class Detail {
        private Long id;
        private String name;
        private String emoji;
        private BigDecimal amount;
        private String payerName;
        private String splitMode;
        private List<SplitDetailItem> splitDetails;
        private String dateLabel;
        private String memo;
    }

    @Getter
    @Builder
    public static class SplitDetailItem {
        private String memberName;
        private BigDecimal amount;
        private BigDecimal percent;
    }
}