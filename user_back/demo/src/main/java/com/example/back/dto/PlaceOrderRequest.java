package com.example.back.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

// 동선 순서
@Getter
@Setter
public class PlaceOrderRequest {
    private List<Long> placeLogIds;
}