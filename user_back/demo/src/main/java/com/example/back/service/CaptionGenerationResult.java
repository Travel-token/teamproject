package com.example.back.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 캡션 생성 결과 한 건.
 * 실제로 어떤 방식(provider)·모델(model)로 만들어졌는지를 caption과 함께 묶어서 돌려준다.
 * OpenAI 호출이 실패해서 템플릿으로 대체(fallback)된 경우에도
 * 여기 담긴 provider/model 값이 "이번 호출에서 실제로 사용된 방식"을 정확히 나타낸다.
 */
@Getter
@AllArgsConstructor
public class CaptionGenerationResult {

    /** 완성된 캡션 문구 */
    private final String caption;

    /** 실제로 사용된 생성 방식. 예: "template", "openai" */
    private final String provider;

    /** 실제로 사용된 모델명. 예: "rule-based-v1", "gpt-4o-mini" */
    private final String model;

    /** 외부 LLM API에 보낸 원본 요청 JSON (디버깅용). 템플릿 방식이면 null */
    private final String requestJson;

    /** 외부 LLM API가 돌려준 원본 응답 JSON (디버깅용). 템플릿 방식이면 null */
    private final String responseJson;
}
