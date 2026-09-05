package com.example.back.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.dto.NotificationResponse;
import com.example.back.service.NotificationService;
import com.example.back.util.SecurityUtil;

import lombok.RequiredArgsConstructor;

// 알림 관리
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> getNotifications() {
        Long userId = SecurityUtil.getCurrentUserId();
        return notificationService.getNotifications(userId);
    }

    // 읽을 처리 관련 controller
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId) {
        Long userId = SecurityUtil.getCurrentUserId();
        notificationService.markAsRead(userId, notificationId);

        return ResponseEntity.noContent().build();
    }
}