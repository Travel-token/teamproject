package com.example.travelapp.domain;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PlaceMapper {

    PlaceVO findByApiContentId(String apiContentId);

    PlaceVO findById(Long id);

    void insert(PlaceVO place);
}
