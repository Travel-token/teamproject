package com.example.back.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.back.dto.TripPhotoResponse;
import com.example.back.service.TripPhotoService;

import lombok.RequiredArgsConstructor;

// 여행 사진
@RestController
@RequestMapping("/api/trips/{tripId}/photos")
@RequiredArgsConstructor
public class TripPhotoController {

    private final TripPhotoService tripPhotoService;

    @GetMapping
    public List<TripPhotoResponse> getPhotos(
            @PathVariable Long tripId) {
        return tripPhotoService.getPhotos(tripId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public TripPhotoResponse uploadPhoto(
            @PathVariable Long tripId,
            @RequestPart("file") MultipartFile file) {
        return tripPhotoService.upload(tripId, file);
    }
}