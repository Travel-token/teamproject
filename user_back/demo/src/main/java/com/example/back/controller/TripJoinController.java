package com.example.back.controller;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.back.service.TripAccess;
@RestController @RequiredArgsConstructor public class TripJoinController {
    private final JdbcTemplate db;
    private final TripAccess access;
    @PostMapping("/api/trips/join") @Transactional public Map<String,Object> join(@RequestBody Map<String,String> body){
        String code=body.getOrDefault("inviteCode","").trim();
        var ids=db.queryForList("SELECT id FROM trips WHERE invite_code=? AND status<>'completed' FOR UPDATE",Long.class,code);
        if(ids.isEmpty())throw new IllegalArgumentException("참여 가능한 초대 코드를 찾을 수 없습니다.");
        Long id=ids.get(0),uid=access.userId();
        if(db.queryForObject("SELECT COUNT(*) FROM trip_members WHERE trip_id=? AND user_id=?",Integer.class,id,uid)==0){
            if(db.queryForObject("SELECT COUNT(*) FROM settlements WHERE trip_id=?",Integer.class,id)>0)throw new IllegalArgumentException("정산 시작 후 참여할 수 없습니다.");
            String name=db.queryForObject("SELECT name FROM users WHERE id=?",String.class,uid);
            db.update("INSERT INTO trip_members(trip_id,user_id,display_name,short_name,color_code,role) VALUES(?,?,?,?, 'tp','member')",id,uid,name,name.substring(0,Math.min(2,name.length())));
        }
        return Map.of("tripId",id);
    }
}
