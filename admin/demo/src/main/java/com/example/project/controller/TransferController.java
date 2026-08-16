package com.example.project.controller;

import com.example.project.common.ApiResponse;
import com.example.project.dto.transfer.TransferRequest;
import com.example.project.dto.transfer.TransferResponse;
import com.example.project.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    /** 송금 목록 조회 */
    @GetMapping
    public ApiResponse<List<TransferResponse.Item>> list(@PathVariable Long tripId) {
        return ApiResponse.ok(transferService.getTransfers(tripId));
    }

    /** 송금 기록 추가 */
    @PostMapping
    public ApiResponse<Void> create(
            @PathVariable Long tripId,
            @Valid @RequestBody TransferRequest.Create request) {
        transferService.createTransfer(tripId, request);
        return ApiResponse.ok("송금 기록이 저장되었습니다.", null);
    }

    /** 송금 기록 삭제 */
    @DeleteMapping("/{transferId}")
    public ApiResponse<Void> delete(
            @PathVariable Long tripId,
            @PathVariable Long transferId) {
        transferService.deleteTransfer(tripId, transferId);
        return ApiResponse.ok("송금 기록이 삭제되었습니다.", null);
    }
}
