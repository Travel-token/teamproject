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
     * @return 추천 캡션
     */
    String generate(String tripName, String region, List<PlaceLog_vo> placeLogs);

    /** 생성 방식 식별자 (llm_provider 컬럼에 기록) */
    String providerName();

    /** 모델명 (llm_model 컬럼에 기록) */
    String modelName();
}
