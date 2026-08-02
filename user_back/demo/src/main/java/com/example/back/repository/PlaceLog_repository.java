package com.example.back.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.back.vo.PlaceLog_vo;

// ============================================================
// PlaceLog_repository : 동선 창고지기 (SQL은 PlaceLog_mapper.xml)
// ============================================================
@Mapper
public interface PlaceLog_repository {

    int insertLog(PlaceLog_vo log);
    List<PlaceLog_vo> findByTripId(Long trip_id);  // 방문 시각 순
    int deleteLog(Long id);
}
