package com.example.back.vo.settlement;

import com.example.back.vo.enums.ParticipantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** settlement_participants : 정산 참여자별 상태 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettlementParticipantVo {

    private Long id;
    private Long settlementId;
    private Long memberId;
    private BigDecimal paidAmount;
    private BigDecimal netAmount;
    private ParticipantStatus status;
    private LocalDateTime updatedAt;
}
