package com.example.back.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.vo.feed.FeedPostPhotoVo;

@Mapper
public interface FeedPostPhotoMapper {

    List<FeedPostPhotoVo> selectByFeedPostId(@Param("feedPostId") Long feedPostId);

    int insertAll(@Param("photos") List<FeedPostPhotoVo> photos);

    int deleteByFeedPostId(@Param("feedPostId") Long feedPostId);
}