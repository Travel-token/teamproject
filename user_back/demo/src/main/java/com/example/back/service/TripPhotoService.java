package com.example.back.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.back.dto.TripPhotoResponse;
import com.example.back.mapper.TripPhotoMapper;
import com.example.back.repository.Trip_repository;
import com.example.back.vo.TripPhotoVo;

import lombok.RequiredArgsConstructor;

// 여행 사진
@Service
@RequiredArgsConstructor
public class TripPhotoService {

    private final TripPhotoMapper tripPhotoMapper;
    private final Trip_repository tripRepository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public List<TripPhotoResponse> getPhotos(Long tripId) {
        return tripPhotoMapper.findByTripId(tripId)
                .stream()
                .map(TripPhotoResponse::from)
                .toList();
    }

    public TripPhotoResponse upload(Long tripId, MultipartFile file) {
        if (tripRepository.findById(tripId) == null) {
            throw new IllegalArgumentException("여행을 찾을 수 없습니다.");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 사진이 없습니다.");
        }

        if(file.getSize()>10*1024*1024)throw new IllegalArgumentException("사진은 10MB 이하만 업로드할 수 있습니다.");
        try(var input=file.getInputStream()) {if(javax.imageio.ImageIO.read(input)==null)throw new IllegalArgumentException("지원하는 이미지 파일이 아닙니다.");}catch(IOException e){throw new IllegalArgumentException("이미지를 읽을 수 없습니다.");}
        String originalName = file.getOriginalFilename();
        String extension = "";

        // 이미지 검사
        // String contentType = file.getContentType();
        // if (contentType == null || !contentType.startsWith("image/")) {
        // throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        // }

        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }

        String savedName = UUID.randomUUID() + extension;
        Path targetDirectory = Path.of(uploadDir, "trip-photos");
        Path targetFile = targetDirectory.resolve(savedName);

        try {
            Files.createDirectories(targetDirectory);
            Files.copy(file.getInputStream(), targetFile,
                    StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("사진 업로드에 실패했습니다.", e);
        }

        TripPhotoVo photo = new TripPhotoVo();
        photo.setTripId(tripId);
        photo.setImageUrl("/uploads/trip-photos/" + savedName);

        tripPhotoMapper.insert(photo);

        return TripPhotoResponse.builder()
                .id(photo.getId())
                .imageUrl(photo.getImageUrl())
                .build();
    }
}