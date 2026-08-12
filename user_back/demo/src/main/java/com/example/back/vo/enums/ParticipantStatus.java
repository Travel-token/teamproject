package com.example.back.vo.enums;

import com.example.back.vo.common.BaseEnumTypeHandler;
import com.example.back.vo.common.CodeEnum;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** settlement_participants.status : done/requested/pending */
@Getter
@RequiredArgsConstructor
public enum ParticipantStatus implements CodeEnum {
    DONE("done"),
    REQUESTED("requested"),
    PENDING("pending");

    private final String code;

    public static class Handler extends BaseEnumTypeHandler<ParticipantStatus> {
        public Handler() {
            super(ParticipantStatus.class);
        }
    }
}
