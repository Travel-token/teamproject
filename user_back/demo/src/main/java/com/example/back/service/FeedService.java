package com.example.back.service;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.back.vo.FeedPostVO;
import com.example.back.dto.FeedCreateRequest;
import com.example.back.dto.FeedUpdateRequest;
import com.example.back.util.SecurityUtil;
@Service @RequiredArgsConstructor public class FeedService {
    private final JdbcTemplate db;
    private final UserService users;
    public List<FeedPostVO> getFeeds(String sort,Double lat,Double lng){
        if(!List.of("popular","latest","distance").contains(sort)) throw new IllegalArgumentException("정렬을 확인해 주세요.");
        if((lat==null)!=(lng==null) || lat!=null && (Math.abs(lat)>90 || Math.abs(lng)>180 || !Double.isFinite(lat) || !Double.isFinite(lng))) throw new IllegalArgumentException("좌표가 올바르지 않습니다.");
        if(sort.equals("distance") && lat==null) throw new IllegalArgumentException("거리순 조회에는 위치가 필요합니다.");
        var items=load(null);
        for(var f:items) if(lat!=null && f.getLat()!=null && f.getLng()!=null){
            double dlat=Math.toRadians(f.getLat()-lat),dlng=Math.toRadians(f.getLng()-lng);
            double a=Math.pow(Math.sin(dlat/2),2)+Math.cos(Math.toRadians(lat))*Math.cos(Math.toRadians(f.getLat()))*Math.pow(Math.sin(dlng/2),2);
            f.setDistanceKm(6371*2*Math.asin(Math.sqrt(Math.min(1,a))));
        }
        Comparator<FeedPostVO> order=Comparator.comparing(FeedPostVO::getCreatedAt).reversed();
        if(sort.equals("popular")) order=Comparator.comparing(FeedPostVO::getLikeCount).reversed().thenComparing(order);
        if(sort.equals("distance")) order=Comparator.comparing(FeedPostVO::getDistanceKm,Comparator.nullsLast(Comparator.naturalOrder()));
        items.sort(order);
        return items;
    }
    private List<FeedPostVO> load(Long id){
        String sql="SELECT f.*,u.name author_name,p.name place_name,p.address,p.latitude,p.longitude,EXISTS(SELECT 1 FROM feed_likes l WHERE l.feed_post_id=f.id AND l.user_id=?) liked FROM feed_posts f JOIN users u ON u.id=f.author_id JOIN places p ON p.id=f.place_id";
        var args=new ArrayList<Object>();
        args.add(SecurityUtil.getCurrentUserId());
        if(id!=null){
            sql+=" WHERE f.id=?";
            args.add(id);
        }
        var result=db.query(sql,(r,n)->{
            var f=new FeedPostVO();
            f.setId(r.getLong("id"));
            f.setUserId(r.getLong("author_id"));
            f.setPlaceId(r.getLong("place_id"));
            f.setCaption(r.getString("caption"));
            f.setLikeCount(r.getLong("likes_count"));
            f.setViewCount(r.getLong("views_count"));
            f.setCommentCount(r.getLong("comments_count"));
            f.setCreatedAt(r.getTimestamp("created_at").toLocalDateTime());
            f.setAuthorName(r.getString("author_name"));
            f.setPlaceName(r.getString("place_name"));
            f.setAddr(r.getString("address"));
            f.setLat(r.getObject("latitude",Double.class));
            f.setLng(r.getObject("longitude",Double.class));
            f.setLikedByMe(r.getBoolean("liked"));
            f.setPopularityScore((double)r.getLong("likes_count"));
            return f;
        },args.toArray());
        for(var f:result){
            f.setPhotoUrls(db.queryForList("SELECT photo_url FROM feed_post_photos WHERE feed_post_id=? ORDER BY sort_order,id",String.class,f.getId()));
            if(!f.getPhotoUrls().isEmpty())f.setThumbnailUrl(f.getPhotoUrls().get(0));
        }
        return result;
    }
    @Transactional public FeedPostVO getFeed(Long id){
        if(db.update("UPDATE feed_posts SET views_count=views_count+1 WHERE id=?",id)==0)throw new IllegalArgumentException("피드가 없습니다.");
        return load(id).get(0);
    }
    @Transactional public FeedPostVO createFeed(FeedPostVO feed){
        if(feed.getPlaceId()==null)throw new IllegalArgumentException("장소를 선택해 주세요.");
        var req=new FeedCreateRequest();
        req.setPlaceId(feed.getPlaceId());
        req.setCaption(feed.getCaption());
        req.setPhotoUrls(feed.getPhotoUrls());
        return load(users.createMyFeed(SecurityUtil.getCurrentUserId(),req).getId()).get(0);
    }
    @Transactional public FeedPostVO updateFeed(Long id,FeedPostVO feed){
        var req=new FeedUpdateRequest();
        req.setCaption(feed.getCaption());
        req.setPhotoUrls(feed.getPhotoUrls());
        users.updateMyFeed(SecurityUtil.getCurrentUserId(),id,req);
        return load(id).get(0);
    }
    @Transactional public void deleteFeed(Long id){
        users.deleteMyFeed(SecurityUtil.getCurrentUserId(),id);
    }
    private void lockFeed(Long id){
        if(db.queryForList("SELECT id FROM feed_posts WHERE id=? FOR UPDATE",Long.class,id).isEmpty())throw new IllegalArgumentException("피드가 없습니다.");
    }
    @Transactional public void like(Long id,Long ignored){
        lockFeed(id);
        Long uid=SecurityUtil.getCurrentUserId();
        if(db.queryForObject("SELECT COUNT(*) FROM feed_likes WHERE feed_post_id=? AND user_id=?",Integer.class,id,uid)==0){
            db.update("INSERT INTO feed_likes(feed_post_id,user_id) VALUES(?,?)",id,uid);
            db.update("UPDATE feed_posts SET likes_count=likes_count+1 WHERE id=?",id);
        }
    }
    @Transactional public void unlike(Long id,Long ignored){
        lockFeed(id);
        int n=db.update("DELETE FROM feed_likes WHERE feed_post_id=? AND user_id=?",id,SecurityUtil.getCurrentUserId());
        if(n>0)db.update("UPDATE feed_posts SET likes_count=GREATEST(0,likes_count-?) WHERE id=?",n,id);
    }
}
