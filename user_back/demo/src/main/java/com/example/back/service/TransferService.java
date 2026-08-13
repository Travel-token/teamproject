package com.example.back.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back.dto.TransferRequest;
import com.example.back.dto.TransferResponse;
import com.example.back.mapper.TransferMapper;
import com.example.back.vo.expense.Transfer;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferMapper transferMapper;

    /** 송금 목록 조회 */
    public List<TransferResponse.Item> getTransfers(Long tripId) {
        return transferMapper.selectTransferList(tripId);
    }

    /** 송금 기록 추가 */
    @Transactional
    public void createTransfer(Long tripId, TransferRequest.Create req) {
        Transfer transfer = new Transfer();
        transfer.setTripId(tripId);
        transfer.setFromName(req.getFromName());
        transfer.setToName(req.getToName());
        transfer.setAmount(req.getAmount());
        transfer.setMemo(req.getMemo());
        transfer.setSpentAt(LocalDateTime.now());

        transferMapper.insertTransfer(transfer);
    }

    /** 송금 기록 삭제 */
    @Transactional
    public void deleteTransfer(Long tripId, Long transferId) {
        transferMapper.deleteTransfer(transferId);
    }
}