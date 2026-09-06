package com.example.back.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * OpenAI(GPT) API 호출 전용 RestClient 등록.
 * feed.reco.provider=openai 일 때만 빈을 만든다 (안 쓰는데 커넥션을 준비할 필요 없음).
 * 빈 이름이 openAiRestClient 로 등록되고, OpenAiCaptionGenerator가 이 이름으로 주입받는다.
 */
@Configuration
@ConditionalOnProperty(name = "feed.reco.provider", havingValue = "openai")
public class OpenAiClientConfig {

    @Bean
    public RestClient openAiRestClient(@Value("${openai.base-url}") String baseUrl,
                                        @Value("${openai.api-key:}") String apiKey) {

        // 연결/응답 대기 시간 제한 - GPT 호출이 지연되거나 응답이 없을 때 무한 대기 방지
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(30_000);

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
