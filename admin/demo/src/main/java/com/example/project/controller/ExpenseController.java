package com.example.project.controller;

import com.example.project.common.ApiResponse;
import com.example.project.dto.expense.ExpenseRequest;
import com.example.project.dto.expense.ExpenseResponse;
import com.example.project.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    /** 지출 목록 조회 */
    @GetMapping
    public ApiResponse<List<ExpenseResponse.Item>> list(@PathVariable Long tripId) {
        return ApiResponse.ok(expenseService.getExpenses(tripId));
    }

    /** 지출 추가 */
    @PostMapping
    public ApiResponse<Void> create(
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest.Create request) {
        expenseService.createExpense(tripId, request);
        return ApiResponse.ok("지출이 등록되었습니다.", null);
    }

    /** 지출 삭제 */
    @DeleteMapping("/{expenseId}")
    public ApiResponse<Void> delete(
            @PathVariable Long tripId,
            @PathVariable Long expenseId) {
        expenseService.deleteExpense(tripId, expenseId);
        return ApiResponse.ok("지출이 삭제되었습니다.", null);
    }
}
