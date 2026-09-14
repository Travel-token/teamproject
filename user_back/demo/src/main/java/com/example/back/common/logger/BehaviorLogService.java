package com.example.back.common.logger;
import org.slf4j.*;
import org.springframework.stereotype.Service;
import com.example.back.recommendation.RecommendationService;
import lombok.RequiredArgsConstructor;
@Service @RequiredArgsConstructor public class BehaviorLogService {
 private static final Logger log=LoggerFactory.getLogger("BEHAVIOR"); private final RecommendationService recommendations; private final org.springframework.jdbc.core.JdbcTemplate db;
 public void feedView(Long u,Long f){event(u,"FEED_VIEW",f);} public void feedLike(Long u,Long f){event(u,"FEED_LIKE",f);}
 public void feedClick(Long u,Long f){event(u,"FEED_CLICK",f);} public void feedCreate(Long u,Long f){event(u,"FEED_CREATE",f);}
 public void feedUpdate(Long u,Long f){event(u,"FEED_UPDATE",f);}
 private void event(Long u,String e,Long f){log.info("userId={} event={} feedId={}",u,e,f); try{
  var rows=db.queryForList("SELECT p.category,p.address FROM feed_posts f JOIN places p ON p.id=f.place_id WHERE f.id=?",f);
  String category=rows.isEmpty()?null:(String)rows.get(0).get("category"); String address=rows.isEmpty()?null:(String)rows.get(0).get("address");
  recommendations.sendEvent(u,e,f,category,address);
 }catch(Exception ignored){log.warn("Recommendation event delivery failed: {}",e);}}
}
