package com.example.back.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.example.back.vo.PlaceLog_vo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * OpenAI(GPT) 기반 캡션 생성기.
 *
 * 동작 순서
 *  1) 여행/동선 정보로 프롬프트 작성
 *  2) OpenAI Chat Completions API 호출
 *  3) 성공하면 GPT가 쓴 캡션을 그대로 사용
 *  4) 실패(키 누락 / 네트워크 오류 / OpenAI 서버 오류 등)하면
 *     화면이 깨지지 않도록 TemplateCaptionGenerator로 자동 대체한다.
 *
 * application.properties의 feed.reco.provider=openai 일 때만 이 구현체가 활성화된다.
 * 실제 키 값은 팀 공유 파일(application.properties)에 절대 적지 않고,
 * 각자 IntelliJ 실행 설정의 환경변수로만 주입한다.
 */
@Service
@Primary
@ConditionalOnProperty(name = "feed.reco.provider", havingValue = "openai")
public class OpenAiCaptionGenerator implements CaptionGenerator {

    private static final Logger log = LoggerFactory.getLogger(OpenAiCaptionGenerator.class);

    private static final String PROVIDER = "openai";

    private static final String SYSTEM_PROMPT = """
            너는 여행 정산 앱 'Travel Token'의 AI 피드 작성 도우미야.
            사용자가 여행 정산을 마친 시점에 올릴 SNS 피드 캡션 초안을 만들어줘.
            조건:
            1) 자연스러운 한국어 구어체로 2~4문장.
            2) 전달된 방문 장소만 언급하고, 없는 사실은 지어내지 않는다.
            3) 과장된 광고 문구나 이모지 남발은 피한다.
            4) 마지막 줄에 어울리는 해시태그 3~4개를 붙인다.
            5) 다른 설명이나 따옴표 없이 캡션 본문만 출력한다.
            """;

    private final RestClient openAiRestClient;
    private final TemplateCaptionGenerator fallback;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public OpenAiCaptionGenerator(@Qualifier("openAiRestClient") RestClient openAiRestClient,
                                   TemplateCaptionGenerator fallback,
                                   ObjectMapper objectMapper,
                                   @Value("${openai.api-key:}") String apiKey,
                                   @Value("${openai.model:gpt-4o-mini}") String model) {
        this.openAiRestClient = openAiRestClient;
        this.fallback = fallback;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public CaptionGenerationResult generate(String tripName, String region, List<PlaceLog_vo> placeLogs) {

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("[FeedReco] OPENAI_API_KEY가 설정되지 않아 템플릿 방식으로 대체합니다.");
            return fallback.generate(tripName, region, placeLogs);
        }

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", buildUserPrompt(tripName, region, placeLogs))
                ),
                "temperature", 0.8,
                "max_tokens", 300
        );

        String requestJson = writeJsonSafely(requestBody);

        try {
            String responseJson = openAiRestClient.post()
                    .uri("/v1/chat/completions")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            String caption = extractCaption(responseJson);

            if (caption == null || caption.isBlank()) {
                log.warn("[FeedReco] OpenAI 응답에서 캡션을 추출하지 못해 템플릿 방식으로 대체합니다. response={}", responseJson);
                return fallback.generate(tripName, region, placeLogs);
            }

            return new CaptionGenerationResult(caption, PROVIDER, model, requestJson, responseJson);

        } catch (RestClientException e) {
            // 네트워크 오류, 401(키 오류)/429(요청 초과)/5xx(OpenAI 서버 오류) 등
            // - GPT 호출이 실패해도 피드 추천 기능 자체는 계속 동작해야 하므로 여기서 흡수한다
            log.warn("[FeedReco] OpenAI 호출 실패, 템플릿 방식으로 대체합니다. reason={}", e.getMessage());
            return fallback.generate(tripName, region, placeLogs);
        }
    }

    private String buildUserPrompt(String tripName, String region, List<PlaceLog_vo> placeLogs) {
        StringBuilder sb = new StringBuilder();
        sb.append("여행 이름: ").append(blankToDefault(tripName, "정보 없음")).append("\n");
        sb.append("지역: ").append(blankToDefault(region, "정보 없음")).append("\n");
        sb.append("방문 동선(시간순):\n");

        if (placeLogs == null || placeLogs.isEmpty()) {
            sb.append("- 기록된 동선 없음\n");
        } else {
            for (PlaceLog_vo entry : placeLogs) {
                sb.append("- ").append(blankToDefault(entry.getName(), "이름 미상 장소"));
                if (entry.getMemo() != null && !entry.getMemo().isBlank()) {
                    sb.append(" (메모: ").append(entry.getMemo().trim()).append(")");
                }
                sb.append("\n");
            }
        }

        sb.append("\n위 정보만 바탕으로 여행 마무리 SNS 피드 캡션을 작성해줘.");
        return sb.toString();
    }

    /** choices[0].message.content 만 뽑아낸다 */
    private String extractCaption(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            return content.isMissingNode() ? null : content.asText().trim();
        } catch (Exception e) {
            log.warn("[FeedReco] OpenAI 응답 파싱 실패. response={}", responseJson, e);
            return null;
        }
    }

    private String writeJsonSafely(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            // 저장/로그용이라 실패해도 캡션 생성 자체는 막지 않는다
            return null;
        }
    }

    private String blankToDefault(String value, String defaultValue) {
        return (value == null || value.isBlank()) ? defaultValue : value.trim();
    }
}
