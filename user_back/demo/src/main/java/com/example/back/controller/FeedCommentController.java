package com.example.back.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.dto.FeedCommentCreateRequest;
import com.example.back.dto.FeedCommentResponse;
import com.example.back.service.FeedCommentService;
import com.example.back.util.SecurityUtil;

import lombok.RequiredArgsConstructor;

// 피드 댓글
@RestController
@RequestMapping("/api/feeds/{feedId}/comments")
@RequiredArgsConstructor
public class FeedCommentController {

    private final FeedCommentService feedCommentService;

    @GetMapping
    public List<FeedCommentResponse> getComments(
            @PathVariable Long feedId) {
        return feedCommentService.getComments(feedId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FeedCommentResponse createComment(
            @PathVariable Long feedId,
            @RequestBody FeedCommentCreateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();

        return feedCommentService.createComment(
                feedId,
                userId,
                request.getContent());
    }
}