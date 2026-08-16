package com.example.project.dto.expense;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

public class ExpenseRequest {

    @Getter @Setter
    public static class Create {
        @NotBlank
        private String name;

        private String emoji = "💳";

        @NotNull @Positive
        private BigDecimal amount;

        @NotBlank
        private String payerName;

        /** even / manual / percent */
        private String splitMode = "even";

        private List<SplitDetailItem> splitDetails;

        private String categoryCode = "meal";

        private String dateLabel;  // "07월 10일 14:30"

        private String memo;
    }

    @Getter @Setter
    public static class SplitDetailItem {
        private String memberName;
        private BigDecimal amount;   // manual 모드
        private BigDecimal percent;  // percent 모드
    }
}
