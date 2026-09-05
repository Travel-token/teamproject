package com.example.back.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.vo.feed.FeedPostVo;

@Mapper
public interface FeedInMyPageMapper {

    List<FeedPostVo> selectByAuthorId(@Param("authorId") Long authorId);

    FeedPostVo selectById(@Param("id") Long id);

    int insert(FeedPostVo feedPost);

    int updateCaption(FeedPostVo feedPost);

    int deleteById(@Param("id") Long id, @Param("authorId") Long authorId);
}