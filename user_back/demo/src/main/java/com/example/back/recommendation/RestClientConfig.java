package com.example.back.recommendation;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient recommendationRestClient() {
        return RestClient.builder()
                .baseUrl("http://localhost:5050") // py flask server
                .build();
    }

}
