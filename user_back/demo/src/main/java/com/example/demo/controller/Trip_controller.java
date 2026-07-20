package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.Trip_RequestDto;
import com.example.demo.dto.Trip_ResponseDto;
import com.example.demo.service.Trip_service;

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
    public ResponseEntity<List<Trip_ResponseDto>> getAllTrips(
            @RequestParam(required = false) String status) {
        // @RequestParam = 주소 뒤 ?status=ended 같은 "물음표 꼬리표"를 꺼내줘
        // required=false = 꼬리표가 없어도 됨 (없으면 status는 null → 전체 목록)
        return ResponseEntity.ok(tripService.getAllTrips(status));
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
    // ---------- [h] 여행 삭제 : DELETE /api/trips/{tripId} ----------
    // {tripId} = 주소 속 변수. /api/trips/3 으로 요청이 오면 tripId에 3이 담김
    // @PathVariable = "주소에서 그 값을 뽑아 변수에 넣어줘"
    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long tripId) {
        boolean deleted = tripService.deleteTrip(tripId);
        if (!deleted) {
            // 그런 방이 없음 → 404 Not Found ("찾는 대상이 없어요")
            return ResponseEntity.notFound().build();
        }
        // 삭제 성공 → 204 No Content ("잘 처리했고 돌려줄 내용은 없어요")
        return ResponseEntity.noContent().build();
    }

    // ---------- [h] 여행 수정 : PATCH /api/trips/{tripId} ----------
    @PatchMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable Long tripId,
                                        @RequestBody Trip_RequestDto request) {
        try {
            Trip_ResponseDto updated = tripService.updateTrip(tripId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ---------- [h-6] 여행 보관함 저장 : POST /api/trips/{tripId}/save ----------
    // 프론트 tripApi.js의 archiveTrip()이 기다리던 바로 그 주소
    @PostMapping("/{tripId}/save")
    public ResponseEntity<?> saveTrip(@PathVariable Long tripId) {
        try {
            return ResponseEntity.ok(tripService.changeStatus(tripId, "saved"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

}