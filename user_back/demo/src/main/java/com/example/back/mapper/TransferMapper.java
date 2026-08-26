package com.example.back.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.dto.TransferResponse;
import com.example.back.vo.expense.Transfer;

import java.util.List;

@Mapper
public interface TransferMapper {

    void insertTransfer(Transfer transfer);

    List<TransferResponse.Item> selectTransferList(@Param("tripId") Long tripId);

    int existsById(@Param("id") Long id);

    void deleteTransfer(@Param("id") Long id);
}