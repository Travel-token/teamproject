package com.example.back.vo.settlement;

import com.example.back.vo.enums.RouteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** settlement_routes : 정산 송금 경로 (최소 송금 횟수 계산 결과) */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettlementRouteVo {

    private Long id;
    private Long settlementId;
    private Long fromMemberId;
    private Long toMemberId;
    private BigDecimal amount;
    private RouteStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
