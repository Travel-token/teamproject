package com.example.back.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.back.vo.PlaceVO;

@Mapper
public interface PlaceMapper {

    PlaceVO findByApiContentId(String apiContentId);

    PlaceVO findById(Long id);

    void insert(PlaceVO place);
}
