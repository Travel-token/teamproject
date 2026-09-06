package com.example.back.service;

import java.util.List;

import com.example.back.vo.PlaceLog_vo;

/**
 * 피드 글 초안 생성기.
 * 구현체 교체로 생성 방식(템플릿 / 외부 LLM)을 전환한다.
 */
public interface CaptionGenerator {

    /**
     * @param tripName  여행명
     * @param region    지역
     * @param placeLogs 방문 동선 (visited_at 오름차순)
     * @return 캡션 + 실제 사용된 provider/model + 디버깅용 요청/응답 원본
     */
    CaptionGenerationResult generate(String tripName, String region, List<PlaceLog_vo> placeLogs);
}
