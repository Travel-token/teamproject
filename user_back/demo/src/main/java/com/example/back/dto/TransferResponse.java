package com.example.back.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

public class TransferResponse {

    @Getter
    @Builder
    public static class Item {
        private Long id;
        private String fromName;
        private String toName;
        private String dateLabel;
        private String method;
        private BigDecimal amount;
        private String memo;
    }
}