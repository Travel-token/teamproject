package com.example.project.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.project.dto.dashboard.DashboardSummaryResponse.RecentTripItem;
import com.example.project.dto.dashboard.DashboardSummaryResponse.RecentUserItem;
import com.example.project.dto.dashboard.DashboardSummaryResponse.SettlementStatusCount;
import com.example.project.dto.dashboard.DashboardSummaryResponse.SignupTrendItem;

import java.util.List;

@Mapper
public interface DashboardMapper {

    long countTotalUsers();

    long countActiveTrips();

    long sumMonthlySettlementAmount();

    long countNewUsersToday();

    List<SignupTrendItem> selectSignupTrend(@Param("days") int days);

    SettlementStatusCount selectSettlementStatusCount();

    List<RecentUserItem> selectRecentUsers(@Param("limit") int limit);

    List<RecentTripItem> selectRecentTrips(@Param("limit") int limit);


    long countTotalUsersAsOfLastMonth();       // 지난달 말 기준 누적 회원 수
    long countTripsCreatedLastMonth();         // 지난달 생성된 여행방 수
    long sumSettlementAmountLastMonth();       // 지난달 정산 총액
    long countNewUsersYesterday();             // 어제 신규 가입
    long countTripsCreatedThisMonth();         // 이번달 생성된 여행방 수 (activeTrips 증감 비교용)
}
