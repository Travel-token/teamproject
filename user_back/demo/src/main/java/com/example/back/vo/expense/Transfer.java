package com.example.back.vo.expense;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

// 송금 기록
@Getter
@Setter
public class Transfer {
    private Long id;
    private Long tripId;
    private Long fromMemberId;
    private Long toMemberId;
    private BigDecimal amount;
    private String memo;
    private LocalDateTime createdAt;
}