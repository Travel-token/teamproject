package com.example.back.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedCommentCreateRequest {

    @NotBlank
    private String content;
}