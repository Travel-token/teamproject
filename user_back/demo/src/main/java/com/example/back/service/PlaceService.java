package com.example.back.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back.dto.PlaceSearchResponse;
import com.example.back.mapper.PlaceMapper;

import lombok.RequiredArgsConstructor;

// 장소 검색
@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceMapper placeMapper;

    public List<PlaceSearchResponse> search(String query) {
        if (query == null || query.trim().isBlank()) {
            return List.of();
        }

        return placeMapper.searchByKeyword(query.trim());
    }
}