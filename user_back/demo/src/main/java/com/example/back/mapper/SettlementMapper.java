package com.example.back.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;


import java.util.List;
import com.example.back.dto.SettlementBalanceResponse;
import com.example.back.dto.SettlementDetailResponse;

// 정산 확정
@Mapper
public interface SettlementMapper {

    Long findInProgressSettlementId(@Param("tripId") Long tripId);

    int completeSettlement(@Param("settlementId") Long settlementId);

    int completeSettlementRoutes(@Param("settlementId") Long settlementId);

Long findLatestSettlementId(@Param("tripId") Long tripId);

String findSettlementStatus(@Param("settlementId") Long settlementId);

List<SettlementDetailResponse.Transfer> findRoutes(
        @Param("settlementId") Long settlementId);

List<SettlementBalanceResponse> findBalances(
        @Param("tripId") Long tripId,
        @Param("userId") Long userId);



}