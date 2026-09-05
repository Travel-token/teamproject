package com.example.back.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back.dto.TransferRequest;
import com.example.back.dto.TransferResponse;
import com.example.back.mapper.TransferMapper;
import com.example.back.vo.expense.Transfer;

import lombok.RequiredArgsConstructor;

// 송금 관리
@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferMapper transferMapper;
    private final TripAccess access;
    private final org.springframework.jdbc.core.JdbcTemplate db;
    private void amount(Long tripId,java.math.BigDecimal value){String currency=db.queryForObject("SELECT currency FROM trips WHERE id=?",String.class,tripId);int scale=List.of("KRW","JPY").contains(currency)?0:2;if(value==null || value.signum()<=0 || value.stripTrailingZeros().scale()>scale)throw new IllegalArgumentException("송금 금액을 확인해 주세요.");}

    public List<TransferResponse.Item> getTransfers(Long tripId) {
        return transferMapper.selectTransferList(tripId);
    }

    @Transactional
    public TransferResponse.Item createTransfer(Long tripId, TransferRequest.Create request) {
        access.mutable(tripId); access.validMember(tripId,request.getFromMemberId());access.validMember(tripId,request.getToMemberId());
        if(request.getFromMemberId().equals(request.getToMemberId()))throw new IllegalArgumentException("보내는 사람과 받는 사람이 같습니다.");
        amount(tripId,request.getAmount());
        Transfer transfer = new Transfer();
        transfer.setTripId(tripId);
        transfer.setFromMemberId(request.getFromMemberId());
        transfer.setToMemberId(request.getToMemberId());
        transfer.setAmount(request.getAmount());
        transfer.setMemo(request.getMemo());

        transferMapper.insertTransfer(transfer);
        return transferMapper.selectTransferList(tripId).stream().filter(x -> x.getId().equals(transfer.getId())).findFirst().orElseThrow();
    }

    @Transactional
    public void updateTransfer(
            Long tripId,
            Long transferId,
            TransferRequest.Update request) {
        access.mutable(tripId);access.validMember(tripId,request.getFromMemberId());access.validMember(tripId,request.getToMemberId());
        if(request.getFromMemberId().equals(request.getToMemberId()))throw new IllegalArgumentException("송금 멤버를 확인해 주세요.");
        amount(tripId,request.getAmount());
        int updated = transferMapper.updateTransfer(
                tripId,
                transferId,
                request);

        if (updated == 0) {
            throw new IllegalArgumentException("송금 내역을 찾을 수 없습니다.");
        }
    }

    @Transactional
    public void deleteTransfer(Long tripId, Long transferId) {
        access.mutable(tripId);
        int deleted = transferMapper.deleteTransfer(tripId, transferId);

        if (deleted == 0) {
            throw new IllegalArgumentException("송금 내역을 찾을 수 없습니다.");
        }
    }
}