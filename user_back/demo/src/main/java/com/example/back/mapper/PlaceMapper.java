package com.example.back.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.dto.PlaceSearchResponse;
import com.example.back.vo.PlaceVO;

@Mapper
public interface PlaceMapper {

    PlaceVO findByApiContentId(String apiContentId);

    PlaceVO findById(Long id);

    void insert(PlaceVO place);

    List<PlaceSearchResponse> searchByKeyword(
            @Param("query") String query);
}
