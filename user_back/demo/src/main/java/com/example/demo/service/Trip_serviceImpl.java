package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.Trip_RequestDto;
import com.example.demo.dto.Trip_ResponseDto;
import com.example.demo.repository.Trip_repository;
import com.example.demo.vo.Trip_vo;


@Service
public class Trip_serviceImpl implements Trip_service {

    private final Trip_repository tripRepository;

    // 생성자 주입: Spring이 창고지기를 자동으로 데려와 연결해 줌
    public Trip_serviceImpl(Trip_repository tripRepository) {
        this.tripRepository = tripRepository;
    }

    @Override
    public Trip_ResponseDto createTrip(Trip_RequestDto request) {

        // ---------- ① 문지기: 필수값 검사 (명세서 f-1~f-3) ----------
        // 프론트에서도 검사하지만 서버에서 "한 번 더" 검사합니다.
        // 프론트 검사는 대문 자물쇠, 서버 검사는 금고 자물쇠 —
        // 프론트를 우회해서 직접 요청을 보내는 경우까지 막아야 하니까요.
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("여행 이름은 필수입니다.");
        }
        if (request.getRegion() == null || request.getRegion().trim().isEmpty()) {
            throw new IllegalArgumentException("여행 지역은 필수입니다.");
        }
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("여행 시작일과 종료일은 필수입니다.");
        }
        // 날짜 모양 검사: 2026-07-15 형태(숫자4-숫자2-숫자2)가 아니면 거절
        if (!request.getStartDate().matches("\\d{4}-\\d{2}-\\d{2}")
                || !request.getEndDate().matches("\\d{4}-\\d{2}-\\d{2}")) {
            throw new IllegalArgumentException("날짜는 yyyy-MM-dd 형식이어야 합니다.");
        }
        // "2026-07-01" < "2026-07-05" : 이 형식은 글자 비교로도 순서가 맞음
        if (request.getEndDate().compareTo(request.getStartDate()) < 0) {
            throw new IllegalArgumentException("종료일이 시작일보다 빠를 수 없습니다.");
        }

        // ---------- ② 옮겨담기: DTO(프론트 상자) → VO(DB 상자) ----------
        Trip_vo trip = new Trip_vo();
        trip.setName(request.getName().trim());
        trip.setEmoji(request.getEmoji());
        trip.setRegion(request.getRegion().trim());
        trip.setStart_date(request.getStartDate());
        trip.setEnd_date(request.getEndDate());
        trip.setBudget(request.getBudget() == null ? 0L : request.getBudget()); // 예산 안 쓰면 0
        trip.setCurrency(request.getCurrency() == null ? "KRW" : request.getCurrency());
        trip.setStatus("ongoing"); // 새 방은 항상 "진행중"으로 시작

        // ---------- ③ 창고에 저장 ----------
        tripRepository.insertTrip(trip);
        // 저장이 끝나면 trip.getTrip_id()에 DB가 발급한 새 번호가 들어있음
        // (Mapper XML의 useGeneratedKeys 덕분)

        // 방금 저장된 줄을 다시 꺼내서(created_at까지 채워진 완전체) 답장 상자에 담아 반환
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
}