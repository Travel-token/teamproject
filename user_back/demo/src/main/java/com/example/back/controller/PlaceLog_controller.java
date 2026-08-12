package com.example.back.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.dto.PlaceLog_RequestDto;
import com.example.back.dto.PlaceLog_ResponseDto;
import com.example.back.service.PlaceLog_service;

// ============================================================
// PlaceLog_controller : 여행 동선 카운터 (k)
//   POST   /api/trips/{tripId}/places          동선 추가
//   GET    /api/trips/{tripId}/places          동선 목록 (방문 시각 순)
//   DELETE /api/trips/{tripId}/places/{logId}  동선 삭제
// (주소는 프론트 관례대로 /places 유지, 실제 테이블은 trip_place_logs)
// ============================================================
@RestController
@RequestMapping("/trips/{tripId}/places")
public class PlaceLog_controller {

    private final PlaceLog_service placeLogService;

    public PlaceLog_controller(PlaceLog_service placeLogService) {
        this.placeLogService = placeLogService;
    }

    @PostMapping
    public ResponseEntity<?> addLog(@PathVariable("tripId") Long tripId,
                                    @RequestBody PlaceLog_RequestDto request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(placeLogService.addLog(tripId, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<PlaceLog_ResponseDto>> getLogs(@PathVariable("tripId") Long tripId) {
        return ResponseEntity.ok(placeLogService.getLogs(tripId));
    }

    @DeleteMapping("/{logId}")
    public ResponseEntity<?> deleteLog(@PathVariable("tripId") Long tripId,
                                       @PathVariable("logId") Long logId) {
        if (!placeLogService.deleteLog(logId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}