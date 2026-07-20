package com.example.demo.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.vo.Place_vo;

// ============================================================
// Place_repository : 장소 창고지기
// ============================================================
@Mapper
public interface Place_repository {

    // 장소 1건 저장 (저장 후 place_id 자동 채워짐)
    int insertPlace(Place_vo place);

    // 특정 여행방의 장소 목록 (동선 = 기록된 순서대로)
    List<Place_vo> findByTripId(Long trip_id);

    // 장소 1건 삭제
    int deletePlace(Long place_id);
}
