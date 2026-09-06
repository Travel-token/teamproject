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
import com.example.back.mapper.FeedInMyPageMapper;
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
    private final org.springframework.jdbc.core.JdbcTemplate db;
    private final FeedInMyPageMapper feedPostMapper;
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
    @Transactional
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
                .id(user.getId())
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
        if(name==null || name.isBlank() || name.length()>50) throw new IllegalArgumentException("이름은 1~50자로 입력해 주세요.");
        userMapper.updateName(userId, name.trim());
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
        db.update("INSERT IGNORE INTO user_settings(user_id) VALUES(?)",userId);
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
        if(Boolean.TRUE.equals(request.getPaySync()))throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,"결제내역 수집 서비스 설정 후 사용할 수 있습니다.");
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
        if(request.getCaption()==null || request.getCaption().isBlank() || request.getCaption().length()>2000) throw new IllegalArgumentException("피드 내용은 1~2000자로 입력해 주세요.");
        if(request.getPlaceId()==null || db.queryForObject("SELECT COUNT(*) FROM places WHERE id=?",Integer.class,request.getPlaceId())==0) throw new IllegalArgumentException("장소를 선택해 주세요.");
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

        if(request.getCaption()==null || request.getCaption().isBlank() || request.getCaption().length()>2000)throw new IllegalArgumentException("피드 내용은 1~2000자로 입력해 주세요.");
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

        var totals=new java.util.LinkedHashMap<String,BigDecimal>();
        db.query("SELECT t.currency,SUM(e.amount) FROM expenses e JOIN trips t ON t.id=e.trip_id JOIN trip_members m ON m.id=e.payer_member_id WHERE m.user_id=? GROUP BY t.currency",(org.springframework.jdbc.core.RowCallbackHandler)r->totals.put(r.getString(1),r.getBigDecimal(2)),userId);
        return ExpenseStatsResponse.builder().totalsByCurrency(totals)
                .totalAmount(total)
                .placeCount(db.queryForObject("SELECT COUNT(*) FROM trip_place_logs l WHERE EXISTS(SELECT 1 FROM trip_members m WHERE m.trip_id=l.trip_id AND m.user_id=?)",Integer.class,userId))
                .categoryStats(stats)
                .build();
    }

    @Override
    public List<TripHistoryResponse> fetchHistoryTrips(Long userId) {
        var result=tripMapper.selectHistoryByUserId(userId);
        for(var t:result){t.setCurrency(db.queryForObject("SELECT currency FROM trips WHERE id=?",String.class,t.getTripId()));t.setPhotoUrls(db.queryForList("SELECT CONCAT('/api/trips/',trip_id,'/photos/',id,'/content') FROM trip_photos WHERE trip_id=? ORDER BY id DESC LIMIT 4",String.class,t.getTripId()));}
        return result;
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
        if(photoUrls.size()>10)throw new IllegalArgumentException("사진은 최대 10장입니다.");
        for (String url : photoUrls) {
            if(url==null || !(url.startsWith("https://") || url.startsWith("http://") || url.startsWith("/api/feed-photos/")))throw new IllegalArgumentException("사진 주소가 올바르지 않습니다.");
            if(url.startsWith("/api/feed-photos/") && !url.startsWith("/api/feed-photos/"+com.example.back.util.SecurityUtil.getCurrentUserId()+"_") && db.queryForObject("SELECT COUNT(*) FROM feed_post_photos WHERE photo_url=?",Integer.class,url)==0)throw new IllegalArgumentException("본인이 업로드한 사진을 선택해 주세요.");
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
