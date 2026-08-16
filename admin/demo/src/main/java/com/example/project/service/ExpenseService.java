package com.example.project.service;

import com.example.project.domain.Expense;
import com.example.project.domain.SplitDetail;
import com.example.project.dto.expense.ExpenseRequest;
import com.example.project.dto.expense.ExpenseResponse;
import com.example.project.mapper.ExpenseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseMapper expenseMapper;

    /** 지출 목록 조회 */
    public List<ExpenseResponse.Item> getExpenses(Long tripId) {
        return expenseMapper.selectExpenseList(tripId);
    }

    /** 지출 추가 */
    @Transactional
    public void createExpense(Long tripId, ExpenseRequest.Create req) {
        Expense expense = new Expense();
        expense.setTripId(tripId);
        expense.setName(req.getName());
        expense.setEmoji(req.getEmoji() != null ? req.getEmoji() : "💳");
        expense.setAmount(req.getAmount());
        expense.setPayerName(req.getPayerName());
        expense.setSplitMode(req.getSplitMode() != null ? req.getSplitMode() : "even");
        expense.setCategoryCode(req.getCategoryCode() != null ? req.getCategoryCode() : "meal");
        expense.setMemo(req.getMemo());
        expense.setSource("manual");
        expense.setSpentAt(LocalDateTime.now());

        expenseMapper.insertExpense(expense);

        // 분배 상세 저장 (manual/percent 모드일 때)
        if (req.getSplitDetails() != null && !req.getSplitDetails().isEmpty()) {
            List<SplitDetail> details = new ArrayList<>();
            for (ExpenseRequest.SplitDetailItem item : req.getSplitDetails()) {
                SplitDetail d = new SplitDetail();
                d.setExpenseId(expense.getId());
                d.setMemberName(item.getMemberName());
                d.setAmount(item.getAmount());
                d.setPercent(item.getPercent());
                details.add(d);
            }
            expenseMapper.insertSplitDetails(details);
        }
    }

    /** 지출 삭제 */
    @Transactional
    public void deleteExpense(Long tripId, Long expenseId) {
        expenseMapper.deleteSplitDetails(expenseId);
        expenseMapper.deleteExpense(expenseId);
    }
}
