package com.example.back.service;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.back.vo.FeedPostVO;
import com.example.back.dto.*;
import com.example.back.util.SecurityUtil;
import com.example.back.common.logger.BehaviorLogService;
import com.example.back.recommendation.RecommendationService;
@Service @RequiredArgsConstructor public class FeedService {
 private final JdbcTemplate db; private final UserService users; private final BehaviorLogService behavior; private final RecommendationService recommendations;
 public List<FeedPostVO> getFeeds(String sort,Double lat,Double lng,String currentRegion){
  if(!List.of("popular","latest","distance").contains(sort))throw new IllegalArgumentException("정렬을 확인해 주세요.");
  if((lat==null)!=(lng==null)||lat!=null&&(Math.abs(lat)>90||Math.abs(lng)>180||!Double.isFinite(lat)||!Double.isFinite(lng)))throw new IllegalArgumentException("좌표가 올바르지 않습니다.");
  if(sort.equals("distance")&&lat==null)throw new IllegalArgumentException("거리순 조회에는 위치가 필요합니다.");
  var items=load(null); for(var f:items)if(lat!=null&&f.getLat()!=null&&f.getLng()!=null){double a=Math.pow(Math.sin(Math.toRadians(f.getLat()-lat)/2),2)+Math.cos(Math.toRadians(lat))*Math.cos(Math.toRadians(f.getLat()))*Math.pow(Math.sin(Math.toRadians(f.getLng()-lng)/2),2);f.setDistanceKm(6371*2*Math.asin(Math.sqrt(Math.min(1,a))));}
  Comparator<FeedPostVO> recent=Comparator.comparing(FeedPostVO::getCreatedAt).reversed();
  if(sort.equals("latest"))items.sort(recent); else if(sort.equals("distance"))items.sort(Comparator.comparing(FeedPostVO::getDistanceKm,Comparator.nullsLast(Comparator.naturalOrder()))); else {
   try{var candidates=items.stream().map(f->{Map<String,Object> c=new HashMap<>();c.put("feedId",f.getId());c.put("popularity",f.getLikeCount()+f.getViewCount()*0.1);c.put("category",Objects.toString(f.getCategory(),""));c.put("region",com.example.back.recommendation.AdministrativeRegion.fromAddress(f.getAddr()));return c;}).toList();var ids=recommendations.rank(SecurityUtil.getCurrentUserId(),candidates,com.example.back.recommendation.AdministrativeRegion.fromAddress(currentRegion));var rank=new HashMap<Long,Integer>();for(int i=0;i<ids.size();i++)rank.put(ids.get(i),i);items.sort(Comparator.comparingInt(f->rank.getOrDefault(f.getId(),Integer.MAX_VALUE)));}
   catch(Exception failure){org.slf4j.LoggerFactory.getLogger(FeedService.class).warn("Recommendation unavailable; using popular feed order ({})", failure.getClass().getSimpleName());items.sort(Comparator.comparing(FeedPostVO::getLikeCount).reversed().thenComparing(recent));}
  } return items;
 }
 private List<FeedPostVO> load(Long id){String sql="SELECT f.*,u.name author_name,p.name place_name,p.address,p.category,p.latitude,p.longitude,EXISTS(SELECT 1 FROM feed_likes l WHERE l.feed_post_id=f.id AND l.user_id=?) liked FROM feed_posts f JOIN users u ON u.id=f.author_id JOIN places p ON p.id=f.place_id";var args=new ArrayList<Object>();args.add(SecurityUtil.getCurrentUserId());if(id!=null){sql+=" WHERE f.id=?";args.add(id);}var result=db.query(sql,(r,n)->{var f=new FeedPostVO();f.setId(r.getLong("id"));f.setUserId(r.getLong("author_id"));f.setPlaceId(r.getLong("place_id"));f.setCaption(r.getString("caption"));f.setLikeCount(r.getLong("likes_count"));f.setViewCount(r.getLong("views_count"));f.setCommentCount(r.getLong("comments_count"));f.setCreatedAt(r.getTimestamp("created_at").toLocalDateTime());f.setAuthorName(r.getString("author_name"));f.setPlaceName(r.getString("place_name"));f.setAddr(r.getString("address"));f.setCategory(r.getString("category"));f.setLat(r.getObject("latitude",Double.class));f.setLng(r.getObject("longitude",Double.class));f.setLikedByMe(r.getBoolean("liked"));f.setPopularityScore((double)r.getLong("likes_count"));return f;},args.toArray());for(var f:result){f.setPhotoUrls(db.queryForList("SELECT photo_url FROM feed_post_photos WHERE feed_post_id=? ORDER BY sort_order,id",String.class,f.getId()));if(!f.getPhotoUrls().isEmpty())f.setThumbnailUrl(f.getPhotoUrls().get(0));}return result;}
 @Transactional public FeedPostVO getFeed(Long id){if(db.update("UPDATE feed_posts SET views_count=views_count+1 WHERE id=?",id)==0)throw new IllegalArgumentException("피드가 없습니다.");behavior.feedView(SecurityUtil.getCurrentUserId(),id);return load(id).get(0);}
 @Transactional public FeedPostVO createFeed(FeedPostVO f){if(f.getPlaceId()==null && (f.getApiContentId()==null || f.getApiContentId().isBlank()))throw new IllegalArgumentException("장소를 선택해 주세요.");var r=new FeedCreateRequest();r.setPlaceId(f.getPlaceId());r.setExternalApiId(f.getApiContentId());r.setPlaceName(f.getPlaceName());r.setAddress(f.getAddr());r.setCategory(f.getCategory());r.setLatitude(f.getLat());r.setLongitude(f.getLng());r.setThumbnailUrl(f.getThumbnailUrl());r.setCaption(f.getCaption());r.setPhotoUrls(f.getPhotoUrls());return load(users.createMyFeed(SecurityUtil.getCurrentUserId(),r).getId()).get(0);}
 @Transactional public FeedPostVO updateFeed(Long id,FeedPostVO f){var r=new FeedUpdateRequest();r.setCaption(f.getCaption());r.setPhotoUrls(f.getPhotoUrls());users.updateMyFeed(SecurityUtil.getCurrentUserId(),id,r);return load(id).get(0);}
 @Transactional public void deleteFeed(Long id){users.deleteMyFeed(SecurityUtil.getCurrentUserId(),id);} private void lock(Long id){if(db.queryForList("SELECT id FROM feed_posts WHERE id=? FOR UPDATE",Long.class,id).isEmpty())throw new IllegalArgumentException("피드가 없습니다.");}
 @Transactional public void like(Long id,Long ignored){lock(id);Long u=SecurityUtil.getCurrentUserId();if(db.queryForObject("SELECT COUNT(*) FROM feed_likes WHERE feed_post_id=? AND user_id=?",Integer.class,id,u)==0){db.update("INSERT INTO feed_likes(feed_post_id,user_id) VALUES(?,?)",id,u);db.update("UPDATE feed_posts SET likes_count=likes_count+1 WHERE id=?",id);behavior.feedLike(u,id);}}
 @Transactional public void unlike(Long id,Long ignored){lock(id);int n=db.update("DELETE FROM feed_likes WHERE feed_post_id=? AND user_id=?",id,SecurityUtil.getCurrentUserId());if(n>0)db.update("UPDATE feed_posts SET likes_count=GREATEST(0,likes_count-?) WHERE id=?",n,id);}
}

