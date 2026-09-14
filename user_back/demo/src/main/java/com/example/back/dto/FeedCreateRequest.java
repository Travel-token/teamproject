package com.example.back.dto;
import java.util.List;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor public class FeedCreateRequest {
 private Long placeId; private String externalApiId; private String placeName; private String address; private String category;
 private Double latitude; private Double longitude; private String thumbnailUrl; private String caption; private List<String> photoUrls;
}
