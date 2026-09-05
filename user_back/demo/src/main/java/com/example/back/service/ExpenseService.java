package com.example.back.service;
import java.util.*;
import java.math.*;
import java.time.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.back.dto.*;
@Service @RequiredArgsConstructor public class ExpenseService {
    private final JdbcTemplate db;
    private final TripAccess access;
    public List<ExpenseResponse.Item> getExpenses(Long tripId){
        access.member(tripId);
        var items=db.query("SELECT e.*,m.display_name,COALESCE((SELECT SUM(s.amount) FROM expense_splits s JOIN trip_members me ON me.id=s.member_id WHERE s.expense_id=e.id AND me.user_id=?),0) my_share FROM expenses e JOIN trip_members m ON m.id=e.payer_member_id WHERE e.trip_id=? ORDER BY e.spent_at DESC,e.id DESC",(r,n)->ExpenseResponse.Item.builder().id(r.getLong("id")).name(r.getString("name")).amount(r.getBigDecimal("amount")).payerMemberId(r.getLong("payer_member_id")).payerName(r.getString("display_name")).categoryCode(r.getString("category_code")).emoji(r.getString("emoji")).splitMode(r.getString("split_mode")).splitLabel(r.getString("split_mode").equals("even")?"균등분할":r.getString("split_mode").equals("percent")?"퍼센트":"직접입력").myShare(r.getBigDecimal("my_share")).spentAt(r.getTimestamp("spent_at").toLocalDateTime()).dateLabel(r.getTimestamp("spent_at").toLocalDateTime().format(java.time.format.DateTimeFormatter.ofPattern("MM월 dd일"))).memo(r.getString("memo")).splits(splits(r.getLong("id"))).build(),access.userId(),tripId);
        return items;
    }
    private List<ExpenseRequest.SplitInput> splits(Long id){
        return db.query("SELECT member_id,amount,percent FROM expense_splits WHERE expense_id=? ORDER BY member_id",(r,n)->{
            var x=new ExpenseRequest.SplitInput();
            x.setMemberId(r.getLong(1));
            x.setAmount(r.getBigDecimal(2));
            x.setPercent(r.getBigDecimal(3));
            return x;
        },id);
    }
    @Transactional public ExpenseResponse.Item createExpense(Long tripId,ExpenseRequest.Create req){
        return save(tripId,null,req);
    }
    @Transactional public ExpenseResponse.Item updateExpense(Long tripId,Long id,ExpenseRequest.Update req){
        return save(tripId,id,req);
    }
    private ExpenseResponse.Item save(Long tripId,Long id,ExpenseRequest.Create req){
        access.mutable(tripId);
        access.validMember(tripId,req.getPayerMemberId());
        if(req.getName()==null || req.getName().isBlank() || req.getName().length()>100)throw new IllegalArgumentException("지출 이름을 확인해 주세요.");
        if(db.queryForObject("SELECT COUNT(*) FROM expense_categories WHERE code=?",Integer.class,req.getCategoryCode())==0)throw new IllegalArgumentException("카테고리를 확인해 주세요.");
        if(id!=null){
            var old=db.queryForList("SELECT * FROM expenses WHERE trip_id=? AND id=?",tripId,id);
            if(old.isEmpty())throw new IllegalArgumentException("지출을 찾을 수 없습니다.");
            if(req.getSplitMode()==null)req.setSplitMode((String)old.get(0).get("split_mode"));
            if(req.getSplits()==null)req.setSplits(splits(id));
            if(req.getSpentAt()==null)req.setSpentAt(((java.sql.Timestamp)old.get(0).get("spent_at")).toLocalDateTime());
            if(req.getEmoji()==null)req.setEmoji((String)old.get(0).get("emoji"));
        }
        if(req.getSplitMode()==null)req.setSplitMode("even");
        if(req.getSpentAt()==null)req.setSpentAt(LocalDateTime.now());
        if(req.getEmoji()==null)req.setEmoji("💳");
        if(req.getEmoji().length()>16)throw new IllegalArgumentException("아이콘을 확인해 주세요.");
        String currency=db.queryForObject("SELECT currency FROM trips WHERE id=?",String.class,tripId);
        int scale=List.of("KRW","JPY").contains(currency)?0:2;
        var amounts=SplitCalculator.calculate(req.getAmount(),req.getSplitMode(),req.getSplits(),scale);
        for(Long mid:amounts.keySet())access.validMember(tripId,mid);
        if(id==null){
            db.update("INSERT INTO expenses(trip_id,name,amount,payer_member_id,category_code,memo,spent_at,emoji,split_mode,source) VALUES(?,?,?,?,?,?,?,?,?,'manual')",tripId,req.getName().trim(),req.getAmount(),req.getPayerMemberId(),req.getCategoryCode(),req.getMemo(),req.getSpentAt(),req.getEmoji(),req.getSplitMode());
            id=db.queryForObject("SELECT LAST_INSERT_ID()",Long.class);
        }
        else db.update("UPDATE expenses SET name=?,amount=?,payer_member_id=?,category_code=?,memo=?,spent_at=?,emoji=?,split_mode=? WHERE id=? AND trip_id=?",req.getName().trim(),req.getAmount(),req.getPayerMemberId(),req.getCategoryCode(),req.getMemo(),req.getSpentAt(),req.getEmoji(),req.getSplitMode(),id,tripId);
        db.update("DELETE FROM expense_splits WHERE expense_id=?",id);
        for(var x:req.getSplits())db.update("INSERT INTO expense_splits(expense_id,member_id,amount,percent) VALUES(?,?,?,?)",id,x.getMemberId(),amounts.get(x.getMemberId()),req.getSplitMode().equals("percent")?x.getPercent():null);
        final Long saved=id;
        return getExpenses(tripId).stream().filter(x->x.getId().equals(saved)).findFirst().orElseThrow();
    }
    @Transactional public void deleteExpense(Long tripId,Long id){
        access.mutable(tripId);
        if(db.update("DELETE FROM expenses WHERE trip_id=? AND id=?",tripId,id)==0)throw new IllegalArgumentException("지출을 찾을 수 없습니다.");
    }
}
