package com.example.back.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.vo.TripPhotoVo;

// 여행 사진 DB Mapper
@Mapper
public interface TripPhotoMapper {

    List<TripPhotoVo> findByTripId(@Param("tripId") Long tripId);

    void insert(TripPhotoVo photo);
}