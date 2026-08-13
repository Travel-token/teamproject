package com.example.back.service;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back.dto.PlaceLog_RequestDto;
import com.example.back.dto.PlaceLog_ResponseDto;
import com.example.back.repository.PlaceLog_repository;
import com.example.back.repository.Trip_repository;
import com.example.back.vo.PlaceLog_vo;

// ============================================================
// PlaceLog_serviceImpl : 동선 요리사 본체 (k)
// 창고지기 둘(동선+여행): 부모 방 실존 확인용
// visited_at이 스키마상 필수라, 비워 보내면 "지금 시각"으로 채움
// ============================================================
@Service
public class PlaceLog_serviceImpl implements PlaceLog_service {

    private final PlaceLog_repository placeLogRepository;
    private final Trip_repository tripRepository;

    public PlaceLog_serviceImpl(PlaceLog_repository placeLogRepository, Trip_repository tripRepository) {
        this.placeLogRepository = placeLogRepository;
        this.tripRepository = tripRepository;
    }

    @Override
    public PlaceLog_ResponseDto addLog(Long tripId, PlaceLog_RequestDto request) {
        // 문지기 ①: 부모 방 실존
        if (tripRepository.findById(tripId) == null) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }
        // 문지기 ②: 장소명 필수
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("장소명은 필수입니다.");
        }

        // 방문 시각 처리 (스키마: DATETIME NOT NULL)
        String visitedAt = request.getVisitedAt();
        if (visitedAt == null || visitedAt.isBlank()) {
            // 비워 보냈으면 = 지금 방문한 것으로
            visitedAt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        } else if (visitedAt.matches("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}")) {
            visitedAt = visitedAt + ":00";   // 초가 없으면 붙여줌
        } else if (!visitedAt.matches("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}")) {
            throw new IllegalArgumentException("방문 시각은 yyyy-MM-dd HH:mm 형식이어야 합니다.");
        }

        PlaceLog_vo log = new PlaceLog_vo();
        log.setTrip_id(tripId);
        log.setPlace_id(request.getPlaceId());          // 자유 입력이면 null
        log.setName(request.getName().trim());
        log.setMemo(request.getMemo());
        log.setLinked_expense_id(null);                  // 지출 연동(권소희)은 이후 단계
        log.setVisited_at(visitedAt);
        log.setDetected_by_gps(Boolean.TRUE.equals(request.getDetectedByGps()) ? 1 : 0);

        placeLogRepository.insertLog(log);

        for (PlaceLog_vo vo : placeLogRepository.findByTripId(tripId)) {
            if (vo.getId().equals(log.getId())) {
                return PlaceLog_ResponseDto.from(vo);
            }
        }
        return PlaceLog_ResponseDto.from(log);
    }

    @Override
    public List<PlaceLog_ResponseDto> getLogs(Long tripId) {
        List<PlaceLog_ResponseDto> result = new ArrayList<>();
        for (PlaceLog_vo vo : placeLogRepository.findByTripId(tripId)) {
            result.add(PlaceLog_ResponseDto.from(vo));
        }
        return result;
    }

    @Override
    public boolean deleteLog(Long logId) {
        return placeLogRepository.deleteLog(logId) > 0;
    }
}
