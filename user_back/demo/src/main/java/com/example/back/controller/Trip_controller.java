package com.example.back.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.dto.Trip_RequestDto;
import com.example.back.dto.Trip_ResponseDto;
import com.example.back.dto.TripMember_RequestDto;
import com.example.back.dto.TripMember_ResponseDto;
import com.example.back.service.Trip_service;

// ============================================================
// Trip_controller : 여행+멤버 카운터
// 창구 목록:
//   POST   /api/trips                      여행 만들기 (owner 멤버 자동 등록)
//   GET    /api/trips?status=completed     목록 (상태 필터)
//   GET    /api/trips/active               진행중 1건 (앱 복원)
//   GET    /api/trips/{id}                 단건 조회
//   PATCH  /api/trips/{id}                 수정
//   DELETE /api/trips/{id}                 삭제 (CASCADE)
//   POST   /api/trips/{id}/complete        여행 종료 (status→completed)
//   GET    /api/trips/{id}/invite-code     초대 코드 조회
//   GET    /api/trips/{id}/members         멤버 목록
//   POST   /api/trips/{id}/members         멤버 추가 (이름만도 OK)
//   DELETE /api/trips/{id}/members/{mid}   멤버 강퇴/탈퇴
// ============================================================
@RestController
@RequestMapping("/api/trips")
public class Trip_controller {

    private final Trip_service tripService;

    public Trip_controller(Trip_service tripService) {
        this.tripService = tripService;
    }

    // ---------- 여행 ----------

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody Trip_RequestDto request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(tripService.createTrip(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Trip_ResponseDto>> getAllTrips(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(tripService.getAllTrips(status));
    }

    @GetMapping("/active")
    public ResponseEntity<Trip_ResponseDto> getActiveTrip() {
        Trip_ResponseDto active = tripService.getActiveTrip();
        if (active == null) {
            return ResponseEntity.noContent().build();   // 204: 진행중 여행 없음
        }
        return ResponseEntity.ok(active);
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<?> getTrip(@PathVariable Long tripId) {
        try {
            return ResponseEntity.ok(tripService.getTrip(tripId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(@PathVariable Long tripId,
                                        @RequestBody Trip_RequestDto request) {
        try {
            return ResponseEntity.ok(tripService.updateTrip(tripId, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long tripId) {
        if (!tripService.deleteTrip(tripId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    // 여행 종료: "정산 끝내기" 등에서 호출 (status → completed)
    @PostMapping("/{tripId}/complete")
    public ResponseEntity<?> completeTrip(@PathVariable Long tripId) {
        try {
            return ResponseEntity.ok(tripService.changeStatus(tripId, "completed"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 초대 코드 조회 (프론트 공유 화면용)
    @GetMapping("/{tripId}/invite-code")
    public ResponseEntity<?> getInviteCode(@PathVariable Long tripId) {
        try {
            return ResponseEntity.ok(Map.of("inviteCode", tripService.getInviteCode(tripId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ---------- 멤버 ----------

    @GetMapping("/{tripId}/members")
    public ResponseEntity<List<TripMember_ResponseDto>> getMembers(@PathVariable Long tripId) {
        return ResponseEntity.ok(tripService.getMembers(tripId));
    }

    @PostMapping("/{tripId}/members")
    public ResponseEntity<?> addMember(@PathVariable Long tripId,
                                       @RequestBody TripMember_RequestDto request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(tripService.addMember(tripId, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{tripId}/members/{memberId}")
    public ResponseEntity<?> removeMember(@PathVariable Long tripId,
                                          @PathVariable Long memberId) {
        if (!tripService.removeMember(memberId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
