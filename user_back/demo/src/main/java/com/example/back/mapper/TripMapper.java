package com.example.back.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.dto.TripHistoryResponse;

@Mapper
public interface TripMapper {
    
    // 이제 까지 여행 + 여행별 총 지출
    List<TripHistoryResponse> selectHistoryByUserId(@Param("userId") Long userId);

}
