package com.example.back.vo.settlement;

import com.example.back.vo.enums.SettlementStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** settlements : 정산 세션 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettlementVo {

    private Long id;
    private Long tripId;
    private BigDecimal totalAmount;
    private BigDecimal perPersonAmount;
    private SettlementStatus status;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
