package com.example.back.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaceVO {

    private Long id;
    private String apiContentId;
    private String name;
    private String addr;
    private String category;
    private Double lat;
    private Double lng;
    private String thumbnailUrl;
}
