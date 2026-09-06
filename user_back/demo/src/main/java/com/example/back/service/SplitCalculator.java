package com.example.back.service;
import java.math.*;
import java.util.*;
import com.example.back.dto.ExpenseRequest.SplitInput;
public final class SplitCalculator {
    private SplitCalculator(){
    }
    public static Map<Long,BigDecimal> calculate(BigDecimal total,String mode,List<SplitInput> inputs,int scale){
        if(total==null || total.signum()<=0 || total.stripTrailingZeros().scale()>scale || inputs==null || inputs.isEmpty())throw new IllegalArgumentException("금액과 참여자를 확인해 주세요.");
        if(mode==null || !List.of("even","manual","percent").contains(mode))throw new IllegalArgumentException("분할 방식을 확인해 주세요.");
        var ordered=new ArrayList<>(inputs);
        if(ordered.stream().anyMatch(x->x.getMemberId()==null))throw new IllegalArgumentException("참여자 ID가 필요합니다.");
        ordered.sort(Comparator.comparing(SplitInput::getMemberId));
        if(ordered.stream().map(SplitInput::getMemberId).distinct().count()!=ordered.size())throw new IllegalArgumentException("참여자가 중복됩니다.");
        BigDecimal sum=BigDecimal.ZERO;
        var result=new LinkedHashMap<Long,BigDecimal>();
        for(var x:ordered){
            BigDecimal amount;
            if(mode.equals("even")) amount=total.divide(BigDecimal.valueOf(ordered.size()),scale,RoundingMode.DOWN);
            else if(mode.equals("manual")){
                amount=x.getAmount();
                if(amount==null || amount.signum()<0 || amount.stripTrailingZeros().scale()>scale)throw new IllegalArgumentException("분할 금액을 확인해 주세요.");
            }
            else{
                var p=x.getPercent();
                if(p==null || p.signum()<0 || p.compareTo(new BigDecimal("100"))>0)throw new IllegalArgumentException("퍼센트를 확인해 주세요.");
                sum=sum.add(p);
                amount=total.multiply(p).divide(new BigDecimal("100"),scale,RoundingMode.DOWN);
            }
            result.put(x.getMemberId(),amount);
        }
        if(mode.equals("percent") && sum.compareTo(new BigDecimal("100"))!=0)throw new IllegalArgumentException("퍼센트 합계가 100이어야 합니다.");
        BigDecimal allocated=result.values().stream().reduce(BigDecimal.ZERO,BigDecimal::add);
        if(mode.equals("manual") && allocated.compareTo(total)!=0)throw new IllegalArgumentException("분할 합계가 지출 금액과 다릅니다.");
        BigDecimal unit=BigDecimal.ONE.movePointLeft(scale),remaining=total.subtract(allocated);
        // Deterministic rounding; zero-percent participants never receive a remainder.
        for(var x:ordered){
            if(remaining.signum()<=0)break;
            if(mode.equals("percent") && x.getPercent().signum()==0)continue;
            result.put(x.getMemberId(),result.get(x.getMemberId()).add(unit));
            remaining=remaining.subtract(unit);
        }
        if(remaining.signum()!=0)throw new IllegalArgumentException("분할 잔액을 계산할 수 없습니다.");
        return result;
    }
}
