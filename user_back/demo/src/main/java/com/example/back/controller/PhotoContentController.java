package com.example.back.controller;
import java.nio.file.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.core.io.*;
import org.springframework.jdbc.core.JdbcTemplate;
@RestController @RequiredArgsConstructor public class PhotoContentController {
    private final JdbcTemplate db;
    @Value("${app.upload-dir}") private String uploadDir;
    @GetMapping("/api/trips/{tripId}/photos/{photoId}/content") public ResponseEntity<Resource> content(@PathVariable Long tripId,@PathVariable Long photoId)throws Exception{
        var urls=db.queryForList("SELECT image_url FROM trip_photos WHERE trip_id=? AND id=?",String.class,tripId,photoId);
        if(urls.isEmpty())return ResponseEntity.notFound().build();
        Path base=Path.of(uploadDir,"trip-photos").toAbsolutePath().normalize();
        Path target=base.resolve(Path.of(urls.get(0)).getFileName()).normalize();
        if(!target.startsWith(base) || !Files.isRegularFile(target))return ResponseEntity.notFound().build();
        String type=Files.probeContentType(target);
        if(type==null || !type.startsWith("image/"))type="application/octet-stream";
        return ResponseEntity.ok().header("Cache-Control","private, no-store").header("X-Content-Type-Options","nosniff").contentType(MediaType.parseMediaType(type)).body(new FileSystemResource(target));
    }
}
