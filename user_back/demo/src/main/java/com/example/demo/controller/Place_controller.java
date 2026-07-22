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