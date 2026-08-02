package com.example.project.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.project.dto.trip.TripBasicRow;
import com.example.project.dto.trip.TripDetailResponse;
import com.example.project.dto.trip.TripListItemResponse;
import com.example.project.dto.trip.TripSearchCondition;

import java.util.List;

@Mapper
public interface TripMapper {

    /** 목록 조회 (검색/상태 필터/페이징). 정산 상태(live/settle/done)는 settlements 테이블 존재 여부로 판단 */
    List<TripListItemResponse> selectTripList(@Param("cond") TripSearchCondition condition);

    long countTripList(@Param("cond") TripSearchCondition condition);

    int existsById(@Param("id") Long id);

    TripBasicRow selectTripBasic(@Param("id") Long id);

    List<TripDetailResponse.CategoryAmount> selectCategoryAmounts(@Param("id") Long id);

    List<TripDetailResponse.TripMember> selectTripMembers(@Param("id") Long id);

    void deleteTrip(@Param("id") Long id);
}
