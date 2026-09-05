package com.example.back.service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.example.back.util.SecurityUtil;
@Service @RequiredArgsConstructor public class TripAccess {
    private final JdbcTemplate db;
    public Long userId(){
        return SecurityUtil.getCurrentUserId();
    }
    public void member(Long tripId){
        if(db.queryForObject("SELECT COUNT(*) FROM trip_members WHERE trip_id=? AND user_id=?",Integer.class,tripId,userId())==0) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"여행에 접근할 권한이 없습니다.");
    }
    public void owner(Long tripId){
        if(db.queryForObject("SELECT COUNT(*) FROM trip_members WHERE trip_id=? AND user_id=? AND role='owner'",Integer.class,tripId,userId())==0) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"방장만 변경할 수 있습니다.");
    }
    public void lock(Long tripId){
        member(tripId);
        db.queryForObject("SELECT id FROM trips WHERE id=? FOR UPDATE",Long.class,tripId);
    }
    public void mutable(Long tripId){
        lock(tripId);
        if(db.queryForObject("SELECT COUNT(*) FROM settlements WHERE trip_id=?",Integer.class,tripId)>0) throw new IllegalArgumentException("정산이 생성된 여행의 금액과 멤버는 변경할 수 없습니다.");
    }
    public void validMember(Long tripId,Long memberId){
        if(memberId==null || db.queryForObject("SELECT COUNT(*) FROM trip_members WHERE trip_id=? AND id=?",Integer.class,tripId,memberId)==0) throw new IllegalArgumentException("여행에 포함되지 않은 멤버입니다.");
    }
}
