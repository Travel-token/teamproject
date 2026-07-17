package com.example.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.example.project.dto.dashboard.DashboardSummaryResponse;
import com.example.project.mapper.DashboardMapper;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int SIGNUP_TREND_DAYS = 7;
    private static final int RECENT_LIMIT = 5;

    private final DashboardMapper dashboardMapper;

    private double growthRate(long current, long previous) {
    if (previous == 0) return current == 0 ? 0.0 : 100.0;
    return Math.round((current - previous) * 1000.0 / previous) / 10.0; // 소수 1자리
    }

    public DashboardSummaryResponse getSummary() {
    long totalUsers = dashboardMapper.countTotalUsers();
    long lastMonthUsers = dashboardMapper.countTotalUsersAsOfLastMonth();

    long tripsThisMonth = dashboardMapper.countTripsCreatedThisMonth();
    long tripsLastMonth = dashboardMapper.countTripsCreatedLastMonth();

    long settlementThisMonth = dashboardMapper.sumMonthlySettlementAmount();
    long settlementLastMonth = dashboardMapper.sumSettlementAmountLastMonth();

    long newToday = dashboardMapper.countNewUsersToday();
    long newYesterday = dashboardMapper.countNewUsersYesterday();
        return new DashboardSummaryResponse(
                dashboardMapper.countTotalUsers(),
                dashboardMapper.countActiveTrips(),
                dashboardMapper.sumMonthlySettlementAmount(),
                dashboardMapper.countNewUsersToday(),
                dashboardMapper.selectSignupTrend(SIGNUP_TREND_DAYS),
                dashboardMapper.selectSettlementStatusCount(),
                dashboardMapper.selectRecentUsers(RECENT_LIMIT),
                dashboardMapper.selectRecentTrips(RECENT_LIMIT),
                growthRate(totalUsers, lastMonthUsers),
                growthRate(tripsThisMonth, tripsLastMonth),
                growthRate(settlementThisMonth, settlementLastMonth),
                growthRate(newToday, newYesterday)
        );
    }
}
