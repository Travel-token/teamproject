package com.example.back.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FeedLikeMapper {

    boolean exists(@Param("feedPostId") Long feedPostId, @Param("userId") Long userId);

    void insert(@Param("feedPostId") Long feedPostId, @Param("userId") Long userId);

    void delete(@Param("feedPostId") Long feedPostId, @Param("userId") Long userId);
}
