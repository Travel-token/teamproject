package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.Trip_RequestDto;
import com.example.demo.dto.Trip_ResponseDto;
import com.example.demo.service.Trip_service;

// ============================================================
// Trip_controller : 주문받는 카운터
// 창구 목록:
//   POST /api/trips         → 여행방 만들기        (f 단계)
//   GET  /api/trips         → 전체 목록            (f 단계)
//   GET  /api/trips/active  → 진행중 여행 1건 [NEW] (g 단계)
//        └ 프론트 TripContext가 앱 시작 때 부르는 바로 그 주소!
// ============================================================
@RestController
@RequestMapping("/api/trips")
public class Trip_controller {

    private final Trip_service tripService;

    public Trip_controller(Trip_service tripService) {
        this.tripService = tripService;
    }

    // ---------- 여행방 만들기 : POST /api/trips ----------
    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody Trip_RequestDto request) {
        try {
            Trip_ResponseDto created = tripService.createTrip(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ---------- 여행방 전체 목록 : GET /api/trips ----------
    @GetMapping
    public ResponseEntity<List<Trip_ResponseDto>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    // ---------- [NEW] 진행중 여행 1건 : GET /api/trips/active ----------
    @GetMapping("/active")
    public ResponseEntity<Trip_ResponseDto> getActiveTrip() {
        Trip_ResponseDto active = tripService.getActiveTrip();
        if (active == null) {
            // 진행중 여행 없음 → 204 No Content
            // = "요청은 잘 처리했는데, 돌려줄 내용물이 없어요"라는 HTTP 정식 표현.
            //   404(주소가 틀림)와는 다른, 정중한 '빈손' 답변이에요.
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(active);
    }
}
