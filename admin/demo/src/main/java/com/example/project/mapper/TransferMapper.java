package com.example.project.mapper;

import com.example.project.domain.Transfer;
import com.example.project.dto.transfer.TransferResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TransferMapper {

    void insertTransfer(Transfer transfer);

    List<TransferResponse.Item> selectTransferList(@Param("tripId") Long tripId);

    int existsById(@Param("id") Long id);

    void deleteTransfer(@Param("id") Long id);
}
