package com.example.back.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.dto.TransferRequest;
import com.example.back.dto.TransferResponse;
import com.example.back.vo.expense.Transfer;

// 송금 DB Mapper
@Mapper
public interface TransferMapper {

    void insertTransfer(Transfer transfer);

    List<TransferResponse.Item> selectTransferList(
            @Param("tripId") Long tripId);

    int updateTransfer(
            @Param("tripId") Long tripId,
            @Param("transferId") Long transferId,
            @Param("request") TransferRequest.Update request);

    int deleteTransfer(
            @Param("tripId") Long tripId,
            @Param("transferId") Long transferId);
}