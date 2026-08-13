package com.example.project.mapper;

import com.example.project.domain.Expense;
import com.example.project.domain.SplitDetail;
import com.example.project.dto.expense.ExpenseResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExpenseMapper {

    void insertExpense(Expense expense);

    void insertSplitDetails(@Param("list") List<SplitDetail> list);

    List<ExpenseResponse.Item> selectExpenseList(@Param("tripId") Long tripId);

    ExpenseResponse.Detail selectExpenseDetail(@Param("id") Long id);

    List<ExpenseResponse.SplitDetailItem> selectSplitDetails(@Param("expenseId") Long expenseId);

    int existsById(@Param("id") Long id);

    void updateExpense(Expense expense);

    void deleteSplitDetails(@Param("expenseId") Long expenseId);

    void deleteExpense(@Param("id") Long id);
}
