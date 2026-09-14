package com.example.back.service;
import java.util.*;
import org.springframework.stereotype.Service;
import com.example.back.recommendation.RecommendationService;
import com.example.back.vo.PlaceLog_vo;
import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor public class TemplateCaptionGenerator implements CaptionGenerator {
 private final RecommendationService recommendations;
 public String generate(String trip,String region,List<PlaceLog_vo> logs){
  List<String> names=logs==null?List.of():logs.stream().map(PlaceLog_vo::getName).filter(Objects::nonNull).filter(x->!x.isBlank()).limit(5).toList();
  try{return recommendations.caption(trip,region,names);}catch(Exception ignored){String title=trip==null||trip.isBlank()?(region==null?"우리 여행":region):trip; return title+" 정산까지 완료! #"+(region==null?"우리":region.replace(" ",""))+"여행 #트래블토큰";}
 }
 public String providerName(){return "python";} public String modelName(){return "behavior-weighted-v1";}
}
