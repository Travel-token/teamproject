package com.example.back.dto;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
public class ExpenseRequest {
 @Getter @Setter public static class Create {
  @NotBlank private String name;
  @NotNull @Positive private BigDecimal amount;
  @NotNull private Long payerMemberId;
  @NotBlank private String categoryCode;
  private String memo;
  private String emoji;
  private LocalDateTime spentAt;
  private String splitMode;
  @Valid private List<SplitInput> splits;
 }
 @Getter @Setter public static class Update extends Create {}
 @Getter @Setter public static class SplitInput {
  @NotNull private Long memberId;
  private BigDecimal amount;
  private BigDecimal percent;
 }
 @Getter @Setter public static class SplitDetailItem {
  private String memberName; private BigDecimal amount; private BigDecimal percent;
 }
}
