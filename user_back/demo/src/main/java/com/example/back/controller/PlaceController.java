package com.example.back.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.dto.PlaceSearchResponse;
import com.example.back.service.PlaceService;

import lombok.RequiredArgsConstructor;

// 장소 검색
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping("/search")
    public List<PlaceSearchResponse> search(
            @RequestParam String query) {
        return placeService.search(query);
    }
}