package com.example.back.mapper;

import java.time.LocalDate;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.dto.CategoryExpenseStat;
import com.example.back.dto.ExpenseResponse;
import com.example.back.vo.expense.Expense;
import com.example.back.vo.expense.SplitDetail;

@Mapper
public interface ExpenseMapper {

    // 박찬민
    List<CategoryExpenseStat> selectCategoryStatsByUser(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to

    );

    // 권소희
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
