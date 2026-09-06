package com.example.back.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.dto.FeedCommentResponse;

@Mapper
public interface FeedCommentMapper {

    List<FeedCommentResponse> findByFeedId(
            @Param("feedId") Long feedId);

    void insert(
            @Param("feedId") Long feedId,
            @Param("userId") Long userId,
            @Param("content") String content);

    FeedCommentResponse findLatestByFeedIdAndUserId(
            @Param("feedId") Long feedId,
            @Param("userId") Long userId);
}