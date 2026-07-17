package com.example.project.common;

import java.util.List;

import lombok.Getter;

@Getter
public class PageResponse<T> {    
    
    private final List<T> content;
    private final int page;       // 1-base 현재 페이지
    private final int size;       // 페이지당 개수
    private final long totalElements;
    private final int totalPages;

    public PageResponse(List<T> content, int page, int size, long totalElements) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = (int) Math.max(1, Math.ceil((double) totalElements / size));
    }
    
}
