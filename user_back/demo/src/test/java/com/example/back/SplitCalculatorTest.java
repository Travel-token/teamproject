package com.example.back;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.util.*;
import com.example.back.dto.ExpenseRequest.SplitInput;
import com.example.back.service.SplitCalculator;
class SplitCalculatorTest {
 SplitInput input(long id,String percent){var x=new SplitInput();x.setMemberId(id);if(percent!=null)x.setPercent(new BigDecimal(percent));return x;}
 @Test void equalRoundingPreservesTotal(){var r=SplitCalculator.calculate(new BigDecimal("100"),"even",List.of(input(3,null),input(1,null),input(2,null)),0);assertEquals(new BigDecimal("34"),r.get(1L));assertEquals(new BigDecimal("100"),r.values().stream().reduce(BigDecimal.ZERO,BigDecimal::add));}
 @Test void percentRoundingExcludesZeroShares(){var r=SplitCalculator.calculate(new BigDecimal("1"),"percent",List.of(input(1,"0"),input(2,"50"),input(3,"50")),0);assertEquals(BigDecimal.ZERO,r.get(1L));assertEquals(BigDecimal.ONE,r.get(2L));}
 @Test void rejectsDuplicates(){assertThrows(IllegalArgumentException.class,()->SplitCalculator.calculate(BigDecimal.TEN,"even",List.of(input(1,null),input(1,null)),0));}
 @Test void dollarCentsArePreserved(){var r=SplitCalculator.calculate(new BigDecimal("1.00"),"even",List.of(input(1,null),input(2,null),input(3,null)),2);assertEquals(new BigDecimal("0.34"),r.get(1L));}
}
