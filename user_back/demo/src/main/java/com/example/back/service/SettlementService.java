package com.example.back.service;
import java.util.*;
import java.math.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.back.dto.*;
@Service @RequiredArgsConstructor public class SettlementService {
    private final JdbcTemplate db;
    private final TripAccess access;
    private final FeedReco_service reco;
    @Transactional public SettlementDetailResponse create(Long tripId){
        access.owner(tripId);
        access.lock(tripId);
        if(latest(tripId)!=null)return getSettlement(tripId);
        if(db.queryForObject("SELECT COUNT(*) FROM expenses e WHERE trip_id=? AND NOT EXISTS(SELECT 1 FROM expense_splits x WHERE x.expense_id=e.id)",Integer.class,tripId)>0)throw new IllegalArgumentException("기존 지출의 분할 정보를 먼저 수정해 주세요.");
        var members=db.queryForList("SELECT id FROM trip_members WHERE trip_id=? ORDER BY id",Long.class,tripId);
        var net=new LinkedHashMap<Long,BigDecimal>();
        var paid=new HashMap<Long,BigDecimal>();
        for(Long mid:members){
            BigDecimal p=sum("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE trip_id=? AND payer_member_id=?",tripId,mid);
            paid.put(mid,p);
            BigDecimal burden=sum("SELECT COALESCE(SUM(s.amount),0) FROM expense_splits s JOIN expenses e ON e.id=s.expense_id WHERE e.trip_id=? AND s.member_id=?",tripId,mid);
            BigDecimal sent=sum("SELECT COALESCE(SUM(amount),0) FROM transfers WHERE trip_id=? AND from_member_id=?",tripId,mid),received=sum("SELECT COALESCE(SUM(amount),0) FROM transfers WHERE trip_id=? AND to_member_id=?",tripId,mid);
            net.put(mid,p.subtract(burden).add(sent).subtract(received));
        }
        if(net.values().stream().reduce(BigDecimal.ZERO,BigDecimal::add).signum()!=0)throw new IllegalArgumentException("분할 금액 합계가 맞지 않습니다.");
        BigDecimal total=paid.values().stream().reduce(BigDecimal.ZERO,BigDecimal::add);
        db.update("INSERT INTO settlements(trip_id,total_amount,per_person_amount,status) VALUES(?,?,?,'in_progress')",tripId,total,total.divide(BigDecimal.valueOf(Math.max(1,members.size())),2,RoundingMode.HALF_UP));
        Long sid=db.queryForObject("SELECT LAST_INSERT_ID()",Long.class);
        for(Long mid:members)db.update("INSERT INTO settlement_participants(settlement_id,member_id,paid_amount,net_amount,status) VALUES(?,?,?,?,?)",sid,mid,paid.get(mid),net.get(mid),net.get(mid).signum()==0?"done":"requested");
        var debt=members.stream().filter(x->net.get(x).signum()<0).toList();
        var credit=members.stream().filter(x->net.get(x).signum()>0).toList();
        int i=0,j=0;
        while(i<debt.size() && j<credit.size()){
            Long from=debt.get(i),to=credit.get(j);
            BigDecimal amount=net.get(from).negate().min(net.get(to));
            db.update("INSERT INTO settlement_routes(settlement_id,from_member_id,to_member_id,amount,status,requested_at) VALUES(?,?,?,?,'requested',NOW())",sid,from,to,amount);
            net.put(from,net.get(from).add(amount));
            net.put(to,net.get(to).subtract(amount));
            if(net.get(from).signum()==0)i++;
            if(net.get(to).signum()==0)j++;
        }
        db.update("INSERT INTO notifications(user_id,trip_id,type,title,body) SELECT m.user_id,?,'settle','정산이 생성됐어요','정산 내역을 확인해 주세요.' FROM trip_members m LEFT JOIN user_settings s ON s.user_id=m.user_id WHERE m.trip_id=? AND m.user_id IS NOT NULL AND COALESCE(s.notif_enabled,1)=1",tripId,tripId);
        return getSettlement(tripId);
    }
    private BigDecimal sum(String sql,Object...args){
        return db.queryForObject(sql,BigDecimal.class,args);
    }
    private Long latest(Long tripId){
        var ids=db.queryForList("SELECT id FROM settlements WHERE trip_id=? ORDER BY id DESC LIMIT 1",Long.class,tripId);
        return ids.isEmpty()?null:ids.get(0);
    }
    public SettlementDetailResponse getSettlement(Long tripId){
        access.member(tripId);
        Long id=latest(tripId);
        if(id==null)return SettlementDetailResponse.builder().settlementId(null).status("not_created").transfers(List.of()).build();
        var routes=db.query("SELECT r.*,f.display_name fn,t.display_name tn,u.bank_name,u.account_number FROM settlement_routes r JOIN trip_members f ON f.id=r.from_member_id JOIN trip_members t ON t.id=r.to_member_id LEFT JOIN users u ON u.id=t.user_id WHERE settlement_id=? ORDER BY r.id",(r,n)->SettlementDetailResponse.Transfer.builder().transferId(r.getLong("id")).fromMemberId(r.getLong("from_member_id")).fromMemberName(r.getString("fn")).toMemberId(r.getLong("to_member_id")).toMemberName(r.getString("tn")).amount(r.getBigDecimal("amount")).status(r.getString("status")).bank(r.getString("bank_name")).accountNumber(r.getString("account_number")).build(),id);
        return SettlementDetailResponse.builder().settlementId(id).status(db.queryForObject("SELECT status FROM settlements WHERE id=?",String.class,id)).transfers(routes).build();
    }
    public List<SettlementBalanceResponse> getBalances(Long tripId){
        access.member(tripId);
        Long sid=latest(tripId);
        if(sid==null)return List.of();
        return db.query("SELECT m.id,m.display_name,m.user_id,p.net_amount,u.bank_name,u.account_number FROM settlement_participants p JOIN trip_members m ON m.id=p.member_id LEFT JOIN users u ON u.id=m.user_id WHERE p.settlement_id=? ORDER BY m.id",(r,n)->SettlementBalanceResponse.builder().memberId(r.getLong(1)).memberName(r.getString(2)).isMe(Objects.equals(r.getObject(3,Long.class),access.userId())).amount(r.getBigDecimal(4)).bank(r.getString(5)).accountNumber(r.getString(6)).build(),sid);
    }
    @Transactional public void completeRoute(Long tripId,Long routeId){
        access.lock(tripId);
        var rows=db.queryForList("SELECT r.* FROM settlement_routes r JOIN settlements s ON s.id=r.settlement_id WHERE r.id=? AND s.trip_id=? FOR UPDATE",routeId,tripId);
        if(rows.isEmpty())throw new IllegalArgumentException("송금 경로가 없습니다.");
        var row=rows.get(0);
        if("completed".equals(row.get("status")))return;
        Long from=((Number)row.get("from_member_id")).longValue(),to=((Number)row.get("to_member_id")).longValue(),sid=((Number)row.get("settlement_id")).longValue();
        if(db.queryForObject("SELECT COUNT(*) FROM trip_members WHERE trip_id=? AND user_id=? AND (id=? OR id=? OR role='owner')",Integer.class,tripId,access.userId(),from,to)==0)throw new IllegalArgumentException("해당 송금을 확인할 권한이 없습니다.");
        BigDecimal amount=(BigDecimal)row.get("amount");
        db.update("INSERT INTO transfers(trip_id,from_member_id,to_member_id,amount,memo) VALUES(?,?,?,?,'정산 송금')",tripId,from,to,amount);
        db.update("UPDATE settlement_routes SET status='completed',completed_at=NOW() WHERE id=?",routeId);
        db.update("UPDATE settlement_participants SET net_amount=net_amount+? WHERE settlement_id=? AND member_id=?",amount,sid,from);
        db.update("UPDATE settlement_participants SET net_amount=net_amount-? WHERE settlement_id=? AND member_id=?",amount,sid,to);
        db.update("UPDATE settlement_participants SET status=IF(net_amount=0,'done','requested') WHERE settlement_id=?",sid);
    }
    @Transactional public void complete(Long tripId){
        access.owner(tripId);
        access.lock(tripId);
        Long sid=latest(tripId);
        if(sid==null)throw new IllegalArgumentException("정산을 먼저 생성해 주세요.");
        if(db.queryForObject("SELECT COUNT(*) FROM settlement_routes WHERE settlement_id=? AND status<>'completed'",Integer.class,sid)>0)throw new IllegalArgumentException("아직 완료하지 않은 송금이 있습니다.");
        db.update("UPDATE settlements SET status='completed',completed_at=COALESCE(completed_at,NOW()) WHERE id=?",sid);
        db.update("UPDATE trips SET status='completed' WHERE id=?",tripId);
        // Idempotent generator uses the same transaction and verifies ownership.
        var req=new FeedReco_GenerateRequestDto();
        req.setSettlementId(sid);
        reco.generate(tripId,req);
    }
}
