package com.example.back.controller;
import java.nio.file.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.io.*;
import com.example.back.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
@RestController @RequiredArgsConstructor public class FeedPhotoController {
    private final JdbcTemplate db;
    @Value("${app.upload-dir}") private String uploadDir;
    @PostMapping(value="/api/feed-photos",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) public Map<String,String> upload(@RequestPart("file") MultipartFile file)throws Exception{
        if(file.isEmpty() || file.getSize()>10*1024*1024)throw new IllegalArgumentException("10MB 이하 사진을 선택해 주세요.");
        java.awt.image.BufferedImage image;
        try(var in=file.getInputStream()){
            image=javax.imageio.ImageIO.read(in);
        }
        if(image==null)throw new IllegalArgumentException("지원하는 이미지가 아닙니다.");
        String filename=SecurityUtil.getCurrentUserId()+"_"+UUID.randomUUID()+".png";
        Path dir=Path.of(uploadDir,"feed-photos").toAbsolutePath().normalize();
        Files.createDirectories(dir);
        javax.imageio.ImageIO.write(image,"png",dir.resolve(filename).toFile());
        return Map.of("url","/api/feed-photos/"+filename);
    }
    @GetMapping("/api/feed-photos/{filename}") public ResponseEntity<Resource> image(@PathVariable String filename){
        if(!filename.matches("[0-9]+_[0-9a-f-]{36}[.]png"))return ResponseEntity.notFound().build();
        String url="/api/feed-photos/"+filename;
        boolean own=filename.startsWith(SecurityUtil.getCurrentUserId()+"_");
        if(!own && db.queryForObject("SELECT COUNT(*) FROM feed_post_photos WHERE photo_url=?",Integer.class,url)==0)return ResponseEntity.status(403).build();
        Path base=Path.of(uploadDir,"feed-photos").toAbsolutePath().normalize(),target=base.resolve(filename).normalize();
        if(!target.startsWith(base)||!Files.isRegularFile(target))return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).header("Cache-Control","private, no-store").body(new FileSystemResource(target));
    }
}
