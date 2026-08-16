package com.example.project.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.example.project.common.ApiResponse;
import com.example.project.common.PageResponse;
import com.example.project.dto.user.UpdateUserStatusRequest;
import com.example.project.dto.user.UserDetailResponse;
import com.example.project.dto.user.UserListItemResponse;
import com.example.project.dto.user.UserSearchCondition;
import com.example.project.service.UserService;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** 회원 목록 조회 (검색/상태/가입경로 필터 + 페이징) */
    @GetMapping
    public ApiResponse<PageResponse<UserListItemResponse>> list(UserSearchCondition condition) {
        return ApiResponse.ok(userService.getUsers(condition));
    }

    /** 회원 상세 조회 */
    @GetMapping("/{id}")
    public ApiResponse<UserDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(userService.getUserDetail(id));
    }

    /** 회원 상태 변경 (활성 <-> 정지) */
    @PatchMapping("/{id}/status")
    public ApiResponse<Void> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateUserStatusRequest request) {
        userService.updateStatus(id, request.getStatus());
        return ApiResponse.ok("회원 상태가 변경되었습니다.", null);
    }
}
