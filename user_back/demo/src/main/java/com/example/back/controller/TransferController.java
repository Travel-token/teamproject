package com.example.back.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.common.ApiResponse;
import com.example.back.dto.TransferRequest;
import com.example.back.dto.TransferResponse;
import com.example.back.service.TransferService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// 송금 관리
@RestController
@RequestMapping("/api/trips/{tripId}/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @GetMapping
    public ApiResponse<List<TransferResponse.Item>> list(
            @PathVariable Long tripId) {
        return ApiResponse.ok(transferService.getTransfers(tripId));
    }

    @PostMapping
    public ApiResponse<TransferResponse.Item> create(
            @PathVariable Long tripId,
            @Valid @RequestBody TransferRequest.Create request) {
        return ApiResponse.ok(transferService.createTransfer(tripId, request));
    }

    @PatchMapping("/{transferId}")
    public ApiResponse<Void> update(
            @PathVariable Long tripId,
            @PathVariable Long transferId,
            @Valid @RequestBody TransferRequest.Update request) {
        transferService.updateTransfer(tripId, transferId, request);
        return ApiResponse.ok("송금 기록이 수정되었습니다.", null);
    }

    @DeleteMapping("/{transferId}")
    public ApiResponse<Void> delete(
            @PathVariable Long tripId,
            @PathVariable Long transferId) {
        transferService.deleteTransfer(tripId, transferId);
        return ApiResponse.ok("송금 기록이 삭제되었습니다.", null);
    }
}