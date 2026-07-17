package com.example.project.dto.trip;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@AllArgsConstructor
public class TripDetailResponse {
    private Long id;
    private String name;
    private String startDate;
    private String endDate;
    private int tripDays;
    private String createdAt;
    private int memberCount;
    private long totalAmount;
    private String status; // live / settle / done

    private List<CategoryAmount> categories;
    private List<TripMember> members;

    @Getter @Setter @NoArgsConstructor
    public static class CategoryAmount {
        private String label;   // 예: "🍜 식사"
        private long amount;
    }

    @Getter @Setter @NoArgsConstructor
    public static class TripMember {
        private Long memberId;
        private String name;         // display_name
        private String shortName;
        private String settleStatus; // done / requested / pending / (정산 시작 전이면 null)
    }
}
