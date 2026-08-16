package com.example.back.service;

import java.time.LocalDate;
import java.util.List;

import com.example.back.dto.ExpenseStatsResponse;
import com.example.back.dto.FeedCreateRequest;
import com.example.back.dto.FeedDetailResponse;
import com.example.back.dto.FeedUpdateRequest;
import com.example.back.dto.NotificationUpdateRequest;
import com.example.back.dto.ProfileResponse;
import com.example.back.dto.TripHistoryResponse;
import com.example.back.vo.user.UserVo;

public interface UserService {

    // 로그인
    UserVo findByEmail(String email);

    // 회원 가입
    void saveid(UserVo user);

    // 마이페이지 - 내 정보 조회
    ProfileResponse getProfile(Long userId);

    // 마이페이지 - 이름 수정
    void updateName(Long userId, String name);

    // 마이페이지 - 송금 계좌 수정
    void updateAccount(Long userId, String bank, String accountNumber);

    // 마이페이지 - 알림/기능 설정 하나 수정 (notifSettle, notifInvite, notifGps, notifMarketing,
    // paySync, darkMode 중 하나)
    void updateSetting(Long userId, NotificationUpdateRequest request);

    List<FeedDetailResponse> fetchMyFeeds(Long userId);

    FeedDetailResponse createMyFeed(Long userId, FeedCreateRequest request);

    FeedDetailResponse updateMyFeed(Long userId, Long feedId, FeedUpdateRequest request);

    void deleteMyFeed(Long userId, Long feedId);

    ExpenseStatsResponse fetchHistoryStats(Long userId, LocalDate from, LocalDate to);

    List<TripHistoryResponse> fetchHistoryTrips(Long userId);

    // void logout(Long userId);

    void withdraw(Long userId);

}
