package com.example.project.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@AllArgsConstructor
public class UserDetailResponse {
    private Long id;
    private String name;
    private String email;
    private String provider;
    private String joinedAt;
    private int tripCount;
    private long totalSpent;
    private String status;
    private List<RecentTrip> recentTrips;

    @Getter @Setter @NoArgsConstructor
    public static class RecentTrip {
        private Long id;
        private String name;     // 이모지가 포함된 여행 이름 (예: "경주 봄 여행 🌸")
        private String period;   // "2026.03.01 ~ 2026.03.04"
        private String status;   // live / settle / done
    }
}
