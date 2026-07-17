package com.example.project.dto.trip;

import com.example.project.common.PageQuery;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TripSearchCondition extends PageQuery {
    private String keyword; // 여행방 이름 검색어
    private String status;  // all / live / settle / done
}
