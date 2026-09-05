package com.example.back.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SettlementBalanceResponse {
    private Long memberId;
    private String memberName;
    private boolean isMe;
    private BigDecimal amount;
    private String bank;
    private String accountNumber;
}