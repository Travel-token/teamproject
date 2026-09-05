package com.example.back.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back.dto.NotificationResponse;
import com.example.back.mapper.NotificationMapper;

import lombok.RequiredArgsConstructor;

// 알림 관리
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationMapper notificationMapper;

    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationMapper.findByUserId(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        int updated = notificationMapper.markAsRead(userId, notificationId);

        if (updated == 0) {
            throw new IllegalArgumentException("알림을 찾을 수 없습니다.");
        }
    }
}