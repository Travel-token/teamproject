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

import com.example.back.dto.FeedReco_GenerateRequestDto;
import com.example.back.dto.FeedReco_ResponseDto;
import com.example.back.dto.FeedReco_StatusRequestDto;
import com.example.back.service.FeedReco_service;

/**
 * AI 피드 추천 API
 *
 * POST   /api/recommendations/trips/{tripId}   추천 생성
 * GET    /api/recommendations?userId=          사용자별 추천 목록
 * GET    /api/recommendations/trips/{tripId}   여행별 추천 목록
 * GET    /api/recommendations/{recoId}         추천 단건
 * PATCH  /api/recommendations/{recoId}         처리 결과 반영
 * DELETE /api/recommendations/{recoId}         추천 삭제
 */
@RestController
@RequestMapping("/api/recommendations")
public class FeedReco_controller {

    /** 로그인 연동 전 기본 사용자 id */
    private static final Long DEFAULT_USER_ID = 1L;

    private final FeedReco_service recoService;

    public FeedReco_controller(FeedReco_service recoService) {
        this.recoService = recoService;
    }

    @PostMapping("/trips/{tripId}")
    public ResponseEntity<?> generate(@PathVariable("tripId") Long tripId,
                                      @RequestBody FeedReco_GenerateRequestDto request) {
        try {
            FeedReco_ResponseDto created = recoService.generate(tripId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<FeedReco_ResponseDto>> getMyRecos(
            @RequestParam(name = "userId", required = false) Long userId) {
        return ResponseEntity.ok(recoService.getByUser(userId == null ? DEFAULT_USER_ID : userId));
    }

    @GetMapping("/trips/{tripId}")
    public ResponseEntity<List<FeedReco_ResponseDto>> getByTrip(@PathVariable("tripId") Long tripId) {
        return ResponseEntity.ok(recoService.getByTrip(tripId));
    }

    @GetMapping("/{recoId}")
    public ResponseEntity<?> getOne(@PathVariable("recoId") Long recoId) {
        try {
            return ResponseEntity.ok(recoService.getOne(recoId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{recoId}")
    public ResponseEntity<?> changeStatus(@PathVariable("recoId") Long recoId,
                                          @RequestBody FeedReco_StatusRequestDto request) {
        try {
            return ResponseEntity.ok(recoService.changeStatus(recoId, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{recoId}")
    public ResponseEntity<?> delete(@PathVariable("recoId") Long recoId) {
        if (!recoService.delete(recoId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
