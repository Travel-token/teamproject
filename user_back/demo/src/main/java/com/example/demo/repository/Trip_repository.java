package com.example.demo.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.demo.vo.Trip_vo;

@Mapper
public interface Trip_repository {

    // 여행방 1건 저장. 저장 후 trip.getTrip_id()에 새 번호가 자동으로 채워짐
    int insertTrip(Trip_vo trip);

    // 고유번호로 여행방 1건 조회
    Trip_vo findById(Long trip_id);

    // 전체 여행방 목록 조회 (최신순)
    List<Trip_vo> findAll();
}