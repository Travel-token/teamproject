package com.example.back.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.service.SettlementService;

import lombok.RequiredArgsConstructor;

import com.example.back.dto.SettlementBalanceResponse;
import com.example.back.dto.SettlementDetailResponse;

@RestController
@RequestMapping("/api/trips/{tripId}/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;
    @PostMapping public SettlementDetailResponse create(@PathVariable Long tripId){return settlementService.create(tripId);}
    @PostMapping("/routes/{routeId}/complete")
    public ResponseEntity<Void> completeRoute(@PathVariable Long tripId,@PathVariable Long routeId){settlementService.completeRoute(tripId,routeId);return ResponseEntity.noContent().build();}

    // 정산 확정
    @PostMapping("/complete")
    public ResponseEntity<?> complete(
            @PathVariable Long tripId) {
        try {
            settlementService.complete(tripId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public SettlementDetailResponse getSettlement(
            @PathVariable Long tripId) {
        return settlementService.getSettlement(tripId);
    }

    @GetMapping("/balances")
    public List<SettlementBalanceResponse> getBalances(
            @PathVariable Long tripId) {
        return settlementService.getBalances(tripId);
    }

    // // 정산 초안 생성
    // @PostMapping
    // public ResponseEntity<SettlementDetailResponse> create(
    // @PathVariable Long tripId) {
    // return ResponseEntity.status(201)
    // .body(settlementService.create(tripId));
    // }
}