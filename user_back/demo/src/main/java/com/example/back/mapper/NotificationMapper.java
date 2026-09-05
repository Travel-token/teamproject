package com.example.back.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.vo.notification.NotificationVo;

// 알림 DB Mapper
@Mapper
public interface NotificationMapper {

    List<NotificationVo> findByUserId(@Param("userId") Long userId);

    int markAsRead(
            @Param("userId") Long userId,
            @Param("notificationId") Long notificationId);
}