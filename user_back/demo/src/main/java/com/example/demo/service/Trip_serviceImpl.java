package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.Trip_RequestDto;
import com.example.demo.dto.Trip_ResponseDto;
import com.example.demo.repository.Trip_repository;
import com.example.demo.vo.Trip_vo;

// ============================================================
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
    public List<Trip_ResponseDto> getAllTrips(String status) {
        // status가 없으면 전체, 있으면 그 상태만 (예: "ended" = 지난 여행)
        List<Trip_vo> voList = (status == null || status.isBlank())
                ? tripRepository.findAll()
                : tripRepository.findByStatus(status);

        List<Trip_ResponseDto> result = new ArrayList<>();
        for (Trip_vo vo : voList) {
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

    // [h] 여행 삭제
    @Override
    public boolean deleteTrip(Long tripId) {
        int deletedRows = tripRepository.deleteTrip(tripId);
        return deletedRows > 0;   // 1줄 이상 지워졌으면 true
    }

    // [h] 여행 수정
    @Override
    public Trip_ResponseDto updateTrip(Long tripId, Trip_RequestDto request) {

        // 1) 문지기 (createTrip과 동일한 검사)
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

        // 2) 옮겨담기: DTO -> VO. 이번엔 trip_id도 담는다! (WHERE의 재료)
        Trip_vo trip = new Trip_vo();
        trip.setTrip_id(tripId);
        trip.setName(request.getName().trim());
        trip.setEmoji(request.getEmoji());
        trip.setRegion(request.getRegion().trim());
        trip.setStart_date(request.getStartDate());
        trip.setEnd_date(request.getEndDate());
        trip.setBudget(request.getBudget() == null ? 0L : request.getBudget());
        trip.setCurrency(request.getCurrency() == null ? "KRW" : request.getCurrency());

        // 3) 창고 작업 + 결과 판단
        int updatedRows = tripRepository.updateTrip(trip);
        if (updatedRows == 0) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }

        // 4) 수정된 최신 모습을 다시 꺼내 답장
        Trip_vo saved = tripRepository.findById(tripId);
        return Trip_ResponseDto.from(saved);
    }

    // [h-6] 여행 상태 변경
    @Override
    public Trip_ResponseDto changeStatus(Long tripId, String status) {
        // 문지기: 허용된 상태값만 통과 (오타나 이상한 값 차단)
        if (!"ongoing".equals(status) && !"ended".equals(status) && !"saved".equals(status)) {
            throw new IllegalArgumentException("status는 ongoing / ended / saved 만 가능합니다.");
        }
        int updatedRows = tripRepository.updateStatus(tripId, status);
        if (updatedRows == 0) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }
        return Trip_ResponseDto.from(tripRepository.findById(tripId));
    }

}