package com.example.back.vo.settlement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** transfers : 수동 송금 기록 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferVo {

    private Long id;
    private Long tripId;
    private Long fromMemberId;
    private Long toMemberId;
    private BigDecimal amount;
    private String memo;
    private LocalDateTime createdAt;
}
