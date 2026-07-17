package com.example.project.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.project.common.PageResponse;
import com.example.project.common.exception.BusinessException;
import com.example.project.dto.trip.TripBasicRow;
import com.example.project.dto.trip.TripDetailResponse;
import com.example.project.dto.trip.TripListItemResponse;
import com.example.project.dto.trip.TripSearchCondition;
import com.example.project.mapper.TripMapper;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripMapper tripMapper;

    public PageResponse<TripListItemResponse> getTrips(TripSearchCondition condition) {
        List<TripListItemResponse> content = tripMapper.selectTripList(condition);
        long total = tripMapper.countTripList(condition);
        return new PageResponse<>(content, condition.getPage(), condition.getLimit(), total);
    }

    public TripDetailResponse getTripDetail(Long id) {
        TripBasicRow basic = tripMapper.selectTripBasic(id);
        if (basic == null) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "여행방을 찾을 수 없습니다.");
        }
        List<TripDetailResponse.CategoryAmount> categories = tripMapper.selectCategoryAmounts(id);
        List<TripDetailResponse.TripMember> members = tripMapper.selectTripMembers(id);

        return new TripDetailResponse(
                basic.getId(), basic.getName(), basic.getStartDate(), basic.getEndDate(),
                basic.getTripDays(), basic.getCreatedAt(), basic.getMemberCount(), basic.getTotalAmount(),
                basic.getStatus(), categories, members
        );
    }

    @Transactional
    public void deleteTrip(Long id) {
        if (tripMapper.existsById(id) == 0) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "여행방을 찾을 수 없습니다.");
        }
        tripMapper.deleteTrip(id);
    }
}
