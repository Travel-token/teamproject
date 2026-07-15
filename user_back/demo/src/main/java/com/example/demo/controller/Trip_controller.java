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

@RestController
@RequestMapping("/api/trips")
public class Trip_controller {

    private final Trip_service tripService;

    // 생성자 주입: Spring이 요리사(Trip_serviceImpl)를 데려와 연결
    public Trip_controller(Trip_service tripService) {
        this.tripService = tripService;
    }

    // ---------- 여행방 만들기 : POST /api/trips ----------
    // @RequestBody : 프론트가 보낸 JSON 소포를 Trip_RequestDto 상자에 자동으로 담아줘
    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody Trip_RequestDto request) {
        try {
            Trip_ResponseDto created = tripService.createTrip(request);
            // 201 Created = "새로 만들었어요" 라는 HTTP 정식 표현
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            // 요리사(문지기)가 거절한 경우
            // 400 Bad Request = "당신이 보낸 내용에 문제가 있어요"
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ---------- 여행방 전체 목록 : GET /api/trips ----------
    // 브라우저에서 http://localhost:8080/api/trips 를 열어
    // 저장이 잘 되는지 눈으로 확인하는 용도로도 씁니다.
    @GetMapping
    public ResponseEntity<List<Trip_ResponseDto>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }
}