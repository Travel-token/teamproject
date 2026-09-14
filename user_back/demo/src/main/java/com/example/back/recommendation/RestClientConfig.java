package com.example.back.recommendation;
import java.time.Duration;
import java.net.http.HttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
@Configuration public class RestClientConfig {
 @Bean public RestClient recommendationRestClient(@Value("${recommendation.base-url:http://localhost:5050}") String baseUrl,
   @Value("${recommendation.api-key:}") String apiKey){
  var f=new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build()); f.setReadTimeout(Duration.ofSeconds(5));
  var builder=RestClient.builder().baseUrl(baseUrl).requestFactory(f);
  if(!apiKey.isBlank())builder.defaultHeader("X-Recommendation-Key",apiKey);
  return builder.build();
 }
}
