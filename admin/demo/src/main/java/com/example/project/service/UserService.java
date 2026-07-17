package com.example.project.service;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.project.common.PageResponse;
import com.example.project.common.exception.BusinessException;
import com.example.project.dto.user.UserBasicRow;
import com.example.project.dto.user.UserDetailResponse;
import com.example.project.dto.user.UserListItemResponse;
import com.example.project.dto.user.UserSearchCondition;
import com.example.project.mapper.UserMapper;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int RECENT_TRIPS_LIMIT = 4;

    private final UserMapper userMapper;

    public PageResponse<UserListItemResponse> getUsers(UserSearchCondition condition) {
        List<UserListItemResponse> content = userMapper.selectUserList(condition);
        long total = userMapper.countUserList(condition);
        return new PageResponse<>(content, condition.getPage(), condition.getLimit(), total);
    }

    public UserDetailResponse getUserDetail(Long id) {
        UserBasicRow basic = userMapper.selectUserBasic(id);
        if (basic == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다.");
        }

        int tripCount = userMapper.countUserTrips(id);
        Long totalSpent = userMapper.sumUserSpent(id);
        List<UserDetailResponse.RecentTrip> recentTrips = userMapper.selectUserRecentTrips(id, RECENT_TRIPS_LIMIT);

        return new UserDetailResponse(
                basic.getId(), basic.getName(), basic.getEmail(), basic.getProvider(),
                basic.getJoinedAt(), tripCount, totalSpent == null ? 0L : totalSpent,
                basic.getStatus(), recentTrips
        );
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        if (userMapper.existsById(id) == 0) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다.");
        }
        userMapper.updateStatus(id, status);
    }
}
