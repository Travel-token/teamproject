package com.example.back.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

// 송금 응답
public class TransferResponse {

    @Getter
    @Builder
    public static class Item {
        private Long id;
        private Long fromMemberId;
        private String fromMemberName;
        private Long toMemberId;
        private String toMemberName;
        private BigDecimal amount;
        private String memo;
        private String createdAt;
    }
}