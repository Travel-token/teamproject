package com.example.demo.controller;

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

import com.example.demo.dto.Place_RequestDto;
import com.example.demo.dto.Place_ResponseDto;
import com.example.demo.service.Place_service;

// ============================================================
// Place_controller : 장소 카운터 (k 단계)
// 간판 주소에 {tripId}가 들어있는 게 특징!
//   POST   /api/trips/3/places     → 3번 방에 장소 추가
//   GET    /api/trips/3/places     → 3번 방의 장소 목록
//   DELETE /api/trips/3/places/7   → 7번 장소 기록 삭제
// "장소는 반드시 어떤 방 소속"이라는 관계가 주소에 그대로 드러남
// (프론트 tripApi.js의 addPlaceLog가 기다리던 바로 그 주소)
// ============================================================
@RestController
@RequestMapping("/api/trips/{tripId}/places")
public class Place_controller {

    private final Place_service placeService;

    public Place_controller(Place_service placeService) {
        this.placeService = placeService;
    }

    // 장소 추가
    @PostMapping
    public ResponseEntity<?> addPlace(@PathVariable Long tripId,
                                      @RequestBody Place_RequestDto request) {
        try {
            Place_ResponseDto created = placeService.addPlace(tripId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 장소 목록
    @GetMapping
    public ResponseEntity<List<Place_ResponseDto>> getPlaces(@PathVariable Long tripId) {
        return ResponseEntity.ok(placeService.getPlaces(tripId));
    }

    // 장소 삭제
    @DeleteMapping("/{placeId}")
    public ResponseEntity<?> deletePlace(@PathVariable Long tripId,
                                         @PathVariable Long placeId) {
        if (!placeService.deletePlace(placeId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}