package com.example.back.dto;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
@Getter @Setter public class PlaceSearchResponse {
 private Long id; private String externalApiId; private String name; private String address; private String category;
 private BigDecimal latitude; private BigDecimal longitude; private String thumbnailUrl;
}
