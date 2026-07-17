package com.example.project.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.common.ApiResponse;
import com.example.project.dto.dashboard.DashboardSummaryResponse;
import com.example.project.service.DashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /** KPI + 최근 7일 가입추이 + 정산 상태 분포 + 최근 회원/여행방을 한 번에 반환 */
    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryResponse> summary() {
        return ApiResponse.ok(dashboardService.getSummary());
    }
}
