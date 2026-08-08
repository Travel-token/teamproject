package com.example.back.recommendation;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RestClient recommendationRestClient;

    // 로그인 정보만 전달
    public void sendLoginUser(Long userId) {
        RecommendationUserRequest request = new RecommendationUserRequest(userId);
        recommendationRestClient.post()
                .uri("/recommendation/user/login")
                .body(request)
                .retrieve()
                .toBodilessEntity();
    }

    // 추후에 각종 로그에 관한 정보들 전달
}
