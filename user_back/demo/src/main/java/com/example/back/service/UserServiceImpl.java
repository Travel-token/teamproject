package com.example.back.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.back.vo.feed.FeedPostPhotoVo;
import com.example.back.vo.feed.FeedPostVo;
import com.example.back.vo.user.UserSettingsVo;
import com.example.back.vo.user.UserVo;
import com.example.back.common.logger.BehaviorLogService;
import com.example.back.dto.CategoryExpenseStat;
import com.example.back.dto.ExpenseStatsResponse;
import com.example.back.dto.FeedCreateRequest;
import com.example.back.dto.FeedDetailResponse;
import com.example.back.dto.FeedUpdateRequest;
import com.example.back.dto.NotificationUpdateRequest;
import com.example.back.dto.ProfileResponse;
import com.example.back.dto.TripHistoryResponse;
import com.example.back.mapper.ExpenseMapper;
import com.example.back.mapper.FeedMapper;
import com.example.back.mapper.FeedPostPhotoMapper;
import com.example.back.mapper.TripMapper;
import com.example.back.mapper.UserMapper;
import com.example.back.mapper.UserSettingsMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    // db 연결 mapper 들
    private final UserMapper userMapper;
    private final FeedMapper feedPostMapper;
    private final FeedPostPhotoMapper feedPostPhotoMapper;
    private final ExpenseMapper expenseMapper;
    private final TripMapper tripMapper;

    private final UserSettingsMapper userSettingsMapper;

    // 로그 관련 서비스
    private final BehaviorLogService behaviorLogService;

    // 로그인
    @Override
    public UserVo findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    // 회원 가입
    @Override
    public void saveid(UserVo user) {
        userMapper.saveid(user);
    }

    // 마이페이지 - 내 정보 조회
    @Override
    public ProfileResponse getProfile(Long userId) {
        UserVo user = userMapper.findById(userId);
        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 사용자입니다.");
        }
        UserSettingsVo settings = userSettingsMapper.selectByUserId(userId);

        String handle = "@" + (user.getEmail() != null ? user.getEmail().split("@")[0] : "user" + userId);

        return ProfileResponse.builder()
                .name(user.getName())
                .handle(handle)
                .bank(user.getBankName() != null ? user.getBankName() : "")
                .accountNumber(user.getAccountNumber() != null ? user.getAccountNumber() : "")
                .notifSettle(settings == null || Boolean.TRUE.equals(settings.getNotifEnabled()))
                .notifInvite(settings == null || Boolean.TRUE.equals(settings.getInviteNotifEnabled()))
                .notifGps(settings == null || Boolean.TRUE.equals(settings.getGpsEnabled()))
                .notifMarketing(settings != null && Boolean.TRUE.equals(settings.getMarketingEnabled()))
                .paySync(settings != null && Boolean.TRUE.equals(settings.getPaySyncEnabled()))
                .darkMode(Boolean.TRUE.equals(user.getDarkMode()))
                .build();
    }

    // 마이페이지 - 이름 수정
    @Override
    @Transactional
    public void updateName(Long userId, String name) {
        userMapper.updateName(userId, name);
    }

    // 마이페이지 - 송금 계좌 수정
    @Override
    @Transactional
    public void updateAccount(Long userId, String bank, String accountNumber) {
        userMapper.updateAccount(userId, bank, accountNumber);
    }

    // 마이페이지 - 알림/기능 설정 하나 수정
    @Override
    @Transactional
    public void updateSetting(Long userId, NotificationUpdateRequest request) {
        if (request.getDarkMode() != null) {
            userMapper.updateDarkMode(userId, request.getDarkMode());
        }
        if (request.getNotifSettle() != null) {
            userSettingsMapper.updateNotifSettle(userId, request.getNotifSettle());
        }
        if (request.getNotifInvite() != null) {
            userSettingsMapper.updateNotifInvite(userId, request.getNotifInvite());
        }
        if (request.getNotifGps() != null) {
            userSettingsMapper.updateNotifGps(userId, request.getNotifGps());
        }
        if (request.getNotifMarketing() != null) {
            userSettingsMapper.updateNotifMarketing(userId, request.getNotifMarketing());
        }
        if (request.getPaySync() != null) {
            userSettingsMapper.updatePaySync(userId, request.getPaySync());
        }
    }

    @Override
    public List<FeedDetailResponse> fetchMyFeeds(Long userId) {
        List<FeedPostVo> posts = feedPostMapper.selectByAuthorId(userId);
        return posts.stream()
                .map(this::toDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FeedDetailResponse createMyFeed(Long userId, FeedCreateRequest request) {
        FeedPostVo post = FeedPostVo.builder()
                .placeId(request.getPlaceId())
                .authorId(userId)
                .caption(request.getCaption())
                .likesCount(0)
                .viewsCount(0)
                .commentsCount(0)
                .build();

        feedPostMapper.insert(post);
        savePhotos(post.getId(), request.getPhotoUrls());

        // 피드 생성 행동 로그
        behaviorLogService.feedCreate(
                userId,
                post.getId());

        return toDetailResponse(feedPostMapper.selectById(post.getId()));
    }

    @Override
    @Transactional
    public FeedDetailResponse updateMyFeed(Long userId, Long feedId, FeedUpdateRequest request) {
        FeedPostVo existing = feedPostMapper.selectById(feedId);
        if (existing == null || !existing.getAuthorId().equals(userId)) {
            throw new IllegalArgumentException("본인의 피드만 수정할 수 있습니다.");
        }

        existing.setCaption(request.getCaption());
        int updated = feedPostMapper.updateCaption(existing);
        if (updated == 0) {
            throw new IllegalStateException("피드 수정에 실패했습니다.");
        }

        if (request.getPhotoUrls() != null) {
            feedPostPhotoMapper.deleteByFeedPostId(feedId);
            savePhotos(feedId, request.getPhotoUrls());
        }

        // 피드 수정 행동 로그
        behaviorLogService.feedUpdate(userId, feedId);

        return toDetailResponse(feedPostMapper.selectById(feedId));
    }

    @Override
    @Transactional
    public void deleteMyFeed(Long userId, Long feedId) {
        FeedPostVo existing = feedPostMapper.selectById(feedId);
        if (existing == null || !existing.getAuthorId().equals(userId)) {
            throw new IllegalArgumentException("본인의 피드만 삭제할 수 있습니다.");
        }

        feedPostPhotoMapper.deleteByFeedPostId(feedId);
        feedPostMapper.deleteById(feedId, userId);
    }

    @Override
    public ExpenseStatsResponse fetchHistoryStats(Long userId, LocalDate from, LocalDate to) {
        List<CategoryExpenseStat> stats = expenseMapper.selectCategoryStatsByUser(userId, from, to);

        BigDecimal total = stats.stream()
                .map(CategoryExpenseStat::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ExpenseStatsResponse.builder()
                .totalAmount(total)
                .categoryStats(stats)
                .build();
    }

    @Override
    public List<TripHistoryResponse> fetchHistoryTrips(Long userId) {
        return tripMapper.selectHistoryByUserId(userId);
    }

    // @Override
    // @Transactional
    // public void logout(Long userId) {
    // // TODO: refresh token / 세션 스토어(Redis 등)를 사용한다면 여기서 무효화 처리
    // }

    @Override
    @Transactional
    public void withdraw(Long userId) {
        userMapper.withdraw(userId);
    }

    private void savePhotos(Long feedPostId, List<String> photoUrls) {
        if (photoUrls == null || photoUrls.isEmpty()) {
            return;
        }
        List<FeedPostPhotoVo> photos = new ArrayList<>();
        int order = 0;
        for (String url : photoUrls) {
            photos.add(FeedPostPhotoVo.builder()
                    .feedPostId(feedPostId)
                    .photoUrl(url)
                    .sortOrder(order++)
                    .build());
        }
        feedPostPhotoMapper.insertAll(photos);
    }

    private FeedDetailResponse toDetailResponse(FeedPostVo post) {
        List<String> photoUrls = feedPostPhotoMapper.selectByFeedPostId(post.getId()).stream()
                .map(FeedPostPhotoVo::getPhotoUrl)
                .collect(Collectors.toList());

        return FeedDetailResponse.builder()
                .id(post.getId())
                .placeId(post.getPlaceId())
                .caption(post.getCaption())
                .distanceKm(post.getDistanceKm())
                .likesCount(post.getLikesCount())
                .viewsCount(post.getViewsCount())
                .commentsCount(post.getCommentsCount())
                .createdAt(post.getCreatedAt())
                .photoUrls(photoUrls)
                .build();
    }
}
