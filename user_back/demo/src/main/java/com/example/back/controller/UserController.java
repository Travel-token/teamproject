package com.example.back.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.dto.AccountUpdateRequest;
import com.example.back.dto.ExpenseStatsResponse;
import com.example.back.dto.FeedCreateRequest;
import com.example.back.dto.FeedDetailResponse;
import com.example.back.dto.FeedUpdateRequest;
import com.example.back.dto.NameUpdateRequest;
import com.example.back.dto.NotificationUpdateRequest;
import com.example.back.dto.ProfileResponse;
import com.example.back.dto.TripHistoryResponse;
import com.example.back.service.UserService;
import com.example.back.util.SecurityUtil;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /*
     * 
     * 마이페이지 피드 관련
     */

    @GetMapping("/feeds") // 본인 피드 전체 불러오기
    public List<FeedDetailResponse> fetchMyFeeds() {
        Long userId = SecurityUtil.getCurrentUserId();
        return userService.fetchMyFeeds(userId);
    }

    @PostMapping("/feeds") // 피드 만들기 (id는 생성 후 응답에 포함)
    public FeedDetailResponse createMyFeed(@RequestBody FeedCreateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        return userService.createMyFeed(userId, request);
    }

    @PutMapping("/feeds/{id}") // 피드 수정
    public FeedDetailResponse updateMyFeed(@PathVariable Long id, @RequestBody FeedUpdateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        return userService.updateMyFeed(userId, id, request);
    }

    @DeleteMapping("/feeds/{id}") // 피드 삭제 (피드 id 리턴)
    public Long deleteMyFeed(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        userService.deleteMyFeed(userId, id);
        return id;
    }

    /*
     * 여행 목록 및 지출 목록
     * 
     */

    @GetMapping("/history/stats") // 이제까지 지출 (카테고리별 합계 + 총합)
    public ExpenseStatsResponse fetchHistoryStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long userId = SecurityUtil.getCurrentUserId();
        return userService.fetchHistoryStats(userId, from, to);
    }

    @GetMapping("/history") // 이제까지 여행 이력 (여행별 총 지출 포함)
    public List<TripHistoryResponse> fetchHistoryTrips() {
        Long userId = SecurityUtil.getCurrentUserId();
        return userService.fetchHistoryTrips(userId);
    }

    /*
     * 마이페이지 - 내 정보 조회, 수정, 탈퇴
     * 
     */

    @GetMapping // 내 프로필 + 알림/설정 조회
    public ProfileResponse getProfile() {
        Long userId = SecurityUtil.getCurrentUserId();
        return userService.getProfile(userId);
    }

    @PatchMapping // 이름 수정
    public void updateName(@RequestBody NameUpdateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        userService.updateName(userId, request.getName());
    }

    @PatchMapping("/account") // 송금 계좌 수정
    public void updateAccount(@RequestBody AccountUpdateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        userService.updateAccount(userId, request.getBank(), request.getAccountNumber());
    }

    @PatchMapping("/notifications") // 알림/기능 설정(다크모드 포함) 하나씩 수정
    public void updateSetting(@RequestBody NotificationUpdateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        userService.updateSetting(userId, request);
    }

    @DeleteMapping // 회원 탈퇴
    public void withdraw() {
        Long userId = SecurityUtil.getCurrentUserId();
        userService.withdraw(userId);
    }

}
