package com.example.travelapp.controller;

import com.example.travelapp.domain.FeedPostVO;
import com.example.travelapp.service.FeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    @GetMapping("/hello")
    public String hello() {
        return "피드 서버 연결 성공!";
    }

    @GetMapping("/feeds")
    public List<FeedPostVO> getFeeds(
            @RequestParam(defaultValue = "popular") String sort,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return feedService.getFeeds(sort, lat, lng);
    }

    @GetMapping("/feeds/{id}")
    public FeedPostVO getFeed(@PathVariable Long id) {
        return feedService.getFeed(id);
    }

    @PostMapping("/feeds")
    public FeedPostVO createFeed(@RequestBody FeedPostVO feed) {
        return feedService.createFeed(feed);
    }

    @PutMapping("/feeds/{id}")
    public FeedPostVO updateFeed(@PathVariable Long id, @RequestBody FeedPostVO feed) {
        return feedService.updateFeed(id, feed);
    }

    @DeleteMapping("/feeds/{id}")
    public String deleteFeed(@PathVariable Long id) {
        feedService.deleteFeed(id);
        return id + "번 피드가 삭제되었습니다!";
    }

    @PostMapping("/feeds/{id}/like")
    public String like(@PathVariable Long id, @RequestParam Long userId) {
        feedService.like(id, userId);
        return "좋아요 등록 완료";
    }

    @DeleteMapping("/feeds/{id}/like")
    public String unlike(@PathVariable Long id, @RequestParam Long userId) {
        feedService.unlike(id, userId);
        return "좋아요 취소 완료";
    }
}
