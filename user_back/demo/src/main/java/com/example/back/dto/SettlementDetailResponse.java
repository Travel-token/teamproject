package com.example.back.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SettlementDetailResponse {
    private Long settlementId;
    private String status;
    private List<Transfer> transfers;

    @Getter
    @Builder
    public static class Transfer {
        private Long transferId;
        private Long fromMemberId;
        private String fromMemberName;
        private Long toMemberId;
        private String toMemberName;
        private BigDecimal amount;
        private String status;
        private String bank;
        private String accountNumber;
    }
}