package com.example.back.auth;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.*;
import com.example.back.service.TripAccess;
import org.springframework.jdbc.core.JdbcTemplate;
@Component @RequiredArgsConstructor public class TripAccessInterceptor implements HandlerInterceptor {
    private final TripAccess access;
    private final JdbcTemplate db;
    @Override public boolean preHandle(HttpServletRequest req,HttpServletResponse res,Object handler){
        var vars=(Map<?,?>)req.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if(vars==null || !vars.containsKey("tripId")) return true;
        Long tripId=Long.valueOf(vars.get("tripId").toString());
        access.member(tripId);
        String method=req.getMethod(), uri=req.getRequestURI();
        if(!method.equals("GET") && (uri.matches("/api/trips/\\d+(?:/complete)?") || uri.contains("/members"))) access.owner(tripId);
        if(vars.containsKey("logId") && db.queryForObject("SELECT COUNT(*) FROM trip_place_logs WHERE trip_id=? AND id=?",Integer.class,tripId,vars.get("logId"))==0) throw new IllegalArgumentException("동선을 찾을 수 없습니다.");
        if(vars.containsKey("memberId")) access.validMember(tripId,Long.valueOf(vars.get("memberId").toString()));
        return true;
    }
}
