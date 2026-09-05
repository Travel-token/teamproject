package com.example.back.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.dto.PlaceLogUpdateRequest;
import com.example.back.vo.PlaceLog_vo;

// ============================================================
// PlaceLog_repository : 동선 창고지기 (SQL은 PlaceLog_mapper.xml)
// ============================================================
@Mapper
public interface PlaceLog_repository {

    int insertLog(PlaceLog_vo log);

    List<PlaceLog_vo> findByTripId(Long trip_id); // 방문 시각 순

    int deleteLog(Long id);

    int updateDisplayOrder(
            @Param("tripId") Long tripId,
            @Param("logId") Long logId,
            @Param("displayOrder") Integer displayOrder);

    int updateLog(
            @Param("tripId") Long tripId,
            @Param("logId") Long logId,
            @Param("request") PlaceLogUpdateRequest request);

    PlaceLog_vo findByTripIdAndId(
            @Param("tripId") Long tripId,
            @Param("logId") Long logId);

}
