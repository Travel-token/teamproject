package com.example.back.recommendation;

import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class RecommendationService {
    private final RestClient recommendationRestClient;
    public void sendLoginUser(Long userId){ recommendationRestClient.post().uri("/recommendation/user/login").body(new RecommendationUserRequest(userId)).retrieve().toBodilessEntity(); }
    public void sendEvent(Long userId,String event,Long feedId,String category,String administrativeRegion){
        Map<String,Object> value=new HashMap<>(); value.put("userId",userId); value.put("event",event); value.put("feedId",feedId);
        if(category!=null&&!category.isBlank())value.put("category",category);
        String area=AdministrativeRegion.fromAddress(administrativeRegion); if(!area.isBlank())value.put("region",area);
        recommendationRestClient.post().uri("/recommend/logs").body(Map.of("logs",List.of(value))).retrieve().toBodilessEntity();
    }
    public String caption(String tripName,String region,List<String> places){
        JsonNode result=recommendationRestClient.post().uri("/caption").body(Map.of("tripName",Objects.toString(tripName,""),"region",AdministrativeRegion.fromAddress(region),"places",places)).retrieve().body(JsonNode.class);
        String value=result==null?"":result.path("caption").asText(); if(value.isBlank()) throw new IllegalStateException("Empty recommendation response"); return value;
    }
    public List<Long> rank(Long userId,List<Map<String,Object>> candidates,String currentRegion){
        JsonNode result=recommendationRestClient.post().uri("/recommend").body(Map.of("userId",userId,"candidates",candidates,"currentRegion",Objects.toString(currentRegion,""),"limit",candidates.size())).retrieve().body(JsonNode.class);
        List<Long> ids=new ArrayList<>(); if(result!=null) for(JsonNode item:result.path("items")) ids.add(item.path("feedId").asLong()); return ids;
    }
}
