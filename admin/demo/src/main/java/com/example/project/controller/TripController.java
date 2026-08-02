package com.example.project.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.example.project.common.ApiResponse;
import com.example.project.common.PageResponse;
import com.example.project.dto.trip.TripDetailResponse;
import com.example.project.dto.trip.TripListItemResponse;
import com.example.project.dto.trip.TripSearchCondition;
import com.example.project.service.TripService;

@RestController
@RequestMapping("/api/admin/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    /** 여행방 목록 조회 (검색/정산상태 필터 + 페이징) */
    @GetMapping
    public ApiResponse<PageResponse<TripListItemResponse>> list(TripSearchCondition condition) {
        return ApiResponse.ok(tripService.getTrips(condition));
    }

    /** 여행방 상세 조회 (카테고리별 지출, 멤버별 정산 상태 포함) */
    @GetMapping("/{id}")
    public ApiResponse<TripDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(tripService.getTripDetail(id));
    }

    /** 여행방 삭제 (연관된 지출/정산/동선 등은 FK CASCADE로 함께 삭제됨) */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        tripService.deleteTrip(id);
        return ApiResponse.ok("여행방이 삭제되었습니다.", null);
    }
}
