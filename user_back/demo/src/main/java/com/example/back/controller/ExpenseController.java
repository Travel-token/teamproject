package com.example.back.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.example.back.common.ApiResponse;
import com.example.back.dto.ExpenseRequest;
import com.example.back.dto.ExpenseResponse;
import com.example.back.service.ExpenseService;

import java.util.List;

@RestController
@RequestMapping("/trips/{tripId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    /** 지출 목록 조회 */
    @GetMapping
    public ApiResponse<List<ExpenseResponse.Item>> list(@PathVariable Long tripId) {
        return ApiResponse.ok(expenseService.getExpenses(tripId));
    }

    // 지출 등록
    @PostMapping
    public ApiResponse<ExpenseResponse.Item> create(
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest.Create request) {
        return ApiResponse.ok(
                expenseService.createExpense(tripId, request));
    }

    // 지출 수정
    @PatchMapping("/{expenseId}")
    public ApiResponse<ExpenseResponse.Item> update(
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest.Update request) {
        return ApiResponse.ok(
                expenseService.updateExpense(tripId, expenseId, request));
    }

    // 지출 삭제
    @DeleteMapping("/{expenseId}")
    public ApiResponse<Void> delete(
            @PathVariable Long tripId,
            @PathVariable Long expenseId) {
        expenseService.deleteExpense(tripId, expenseId);
        return ApiResponse.ok("지출이 삭제되었습니다.", null);
    }
}
