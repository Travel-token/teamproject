package com.example.travelapp.domain;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FeedPostMapper {

    List<FeedPostVO> findAll(@Param("sort") String sort, @Param("lat") Double lat, @Param("lng") Double lng);

    FeedPostVO findById(@Param("id") Long id);

    void insert(FeedPostVO feedPost);

    void update(FeedPostVO feedPost);

    void deleteById(@Param("id") Long id);

    void incrementViewCount(@Param("id") Long id);

    void incrementLikeCount(@Param("id") Long id);

    void decrementLikeCount(@Param("id") Long id);
}
