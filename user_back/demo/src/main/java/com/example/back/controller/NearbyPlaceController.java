package com.example.back.controller;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
@RestController @RequiredArgsConstructor public class NearbyPlaceController {
    private final JdbcTemplate db;
    @GetMapping("/api/places/nearby") public List<Map<String,Object>> nearby(@RequestParam double lat,@RequestParam double lng){
        if(!Double.isFinite(lat)||!Double.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)throw new IllegalArgumentException("위치 좌표가 올바르지 않습니다.");
        return db.queryForList("SELECT id,name,address,latitude,longitude,NULL thumbnailUrl,6371*ACOS(LEAST(1,GREATEST(-1,COS(RADIANS(?))*COS(RADIANS(latitude))*COS(RADIANS(longitude)-RADIANS(?))+SIN(RADIANS(?))*SIN(RADIANS(latitude))))) distanceKm FROM places WHERE latitude IS NOT NULL AND longitude IS NOT NULL HAVING distanceKm<=50 ORDER BY distanceKm,id LIMIT 20",lat,lng,lat);
    }
}
