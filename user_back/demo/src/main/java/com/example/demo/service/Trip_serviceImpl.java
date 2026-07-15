package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.Trip_RequestDto;
import com.example.demo.dto.Trip_ResponseDto;
import com.example.demo.repository.Trip_repository;
import com.example.demo.vo.Trip_vo;

// ============================================================
// Trip_serviceImpl : 요리사 본체
// [g 단계에서 추가된 것] getActiveTrip 구현
// ============================================================
@Service
public class Trip_serviceImpl implements Trip_service {

    private final Trip_repository tripRepository;

    public Trip_serviceImpl(Trip_repository tripRepository) {
        this.tripRepository = tripRepository;
    }

    @Override
    public Trip_ResponseDto createTrip(Trip_RequestDto request) {

        // ---------- ① 문지기: 필수값 검사 ----------
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("여행 이름은 필수입니다.");
        }
        if (request.getRegion() == null || request.getRegion().trim().isEmpty()) {
            throw new IllegalArgumentException("여행 지역은 필수입니다.");
        }
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("여행 시작일과 종료일은 필수입니다.");
        }
        if (!request.getStartDate().matches("\\d{4}-\\d{2}-\\d{2}")
                || !request.getEndDate().matches("\\d{4}-\\d{2}-\\d{2}")) {
            throw new IllegalArgumentException("날짜는 yyyy-MM-dd 형식이어야 합니다.");
        }
        if (request.getEndDate().compareTo(request.getStartDate()) < 0) {
            throw new IllegalArgumentException("종료일이 시작일보다 빠를 수 없습니다.");
        }

        // ---------- ② 옮겨담기: DTO → VO ----------
        Trip_vo trip = new Trip_vo();
        trip.setName(request.getName().trim());
        trip.setEmoji(request.getEmoji());
        trip.setRegion(request.getRegion().trim());
        trip.setStart_date(request.getStartDate());
        trip.setEnd_date(request.getEndDate());
        trip.setBudget(request.getBudget() == null ? 0L : request.getBudget());
        trip.setCurrency(request.getCurrency() == null ? "KRW" : request.getCurrency());
        trip.setStatus("ongoing");

        // ---------- ③ 창고에 저장 ----------
        tripRepository.insertTrip(trip);

        Trip_vo saved = tripRepository.findById(trip.getTrip_id());
        return Trip_ResponseDto.from(saved);
    }

    @Override
    public List<Trip_ResponseDto> getAllTrips() {
        List<Trip_ResponseDto> result = new ArrayList<>();
        for (Trip_vo vo : tripRepository.findAll()) {
            result.add(Trip_ResponseDto.from(vo));
        }
        return result;
    }

    // [NEW] 진행중 여행 1건 조회
    @Override
    public Trip_ResponseDto getActiveTrip() {
        Trip_vo vo = tripRepository.findActive();
        if (vo == null) {
            // 진행중인 여행이 하나도 없는 경우.
            // null = "없음"을 그대로 전달하고, 어떻게 답할지는 카운터가 결정
            return null;
        }
        return Trip_ResponseDto.from(vo);
    }
}
