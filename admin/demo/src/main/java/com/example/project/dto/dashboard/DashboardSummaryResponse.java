package com.example.project.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 최상위 DTO는 서비스 계층에서 조립만 하므로 불변으로 두고,
 * MyBatis가 직접 매핑하는 내부 아이템 클래스들은 setter 기반 자동 매핑을 쓴다.
 */
@Getter
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long totalUsers;              // 총 회원 수
    private long activeTrips;             // 진행중인 여행방 수 (정산 시작 전)
    private long monthlySettlementAmount; // 이번 달 정산 총액 (원)
    private long newUsersToday;           // 오늘 신규 가입

        

    private List<SignupTrendItem> signupTrend;      // 최근 N일 가입 추이
    private SettlementStatusCount settlementStatus; // 여행방 정산 상태 분포

    private List<RecentUserItem> recentUsers;
    private List<RecentTripItem> recentTrips;

    private double totalUsersDeltaPct;
    private double activeTripsDeltaPct;
    private double settlementAmountDeltaPct;
    private double newUsersDeltaPct;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class SignupTrendItem {
        private String date;   // yyyy-MM-dd
        private long count;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class SettlementStatusCount {
        private long live;    // 진행중
        private long settle;  // 정산중
        private long done;    // 정산완료
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RecentUserItem {
        private Long id;
        private String name;
        private String provider;
        private int tripCount;
        private String joinedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RecentTripItem {
        private Long id;
        private String name;
        private int memberCount;
        private long totalAmount;
        private String status; // live/settle/done
    }
}
