package com.example.back.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

// 송금 요청
public class TransferRequest {

    @Getter
    @Setter
    public static class Create {

        @NotNull
        private Long fromMemberId;

        @NotNull
        private Long toMemberId;

        @NotNull
        @Positive
        private BigDecimal amount;

        private String memo;
    }

    @Getter
    @Setter
    public static class Update {

        @NotNull
        private Long fromMemberId;

        @NotNull
        private Long toMemberId;

        @NotNull
        @Positive
        private BigDecimal amount;

        private String memo;
    }
}