package com.example.back.mapper;

import java.time.LocalDate;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.dto.CategoryExpenseStat;

@Mapper
public interface ExpenseMapper {
        List<CategoryExpenseStat> selectCategoryStatsByUser(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}
