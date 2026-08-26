package com.example.back.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

public class TransferRequest {

    @Getter
    @Setter
    public static class Create {
        @NotBlank
        private String fromName;

        @NotBlank
        private String toName;

        @NotNull
        @Positive
        private BigDecimal amount;

        private String dateLabel;

        private String memo;
    }
}