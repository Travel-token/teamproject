package com.example.project.domain;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** transfers 테이블 매핑 */
@Getter
@Setter
public class Transfer {
    private Long id;
    private Long tripId;
    private String fromName;
    private String toName;
    private BigDecimal amount;
    private LocalDateTime spentAt;
    private String memo;
    private LocalDateTime createdAt;
}
