package com.example.back.service;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.back.dto.FeedCommentResponse;
@Service @RequiredArgsConstructor public class FeedCommentService {
    private final JdbcTemplate db;
    public List<FeedCommentResponse> getComments(Long id){
        return db.query("SELECT c.id,u.name,c.content FROM feed_comments c JOIN users u ON u.id=c.user_id WHERE c.feed_post_id=? ORDER BY c.created_at,c.id",(r,n)->FeedCommentResponse.builder().id(r.getLong(1)).authorName(r.getString(2)).content(r.getString(3)).build(),id);
    }
    @Transactional public FeedCommentResponse createComment(Long id,Long uid,String content){
        if(content==null || content.isBlank() || content.length()>1000)throw new IllegalArgumentException("댓글은 1~1000자로 입력해 주세요.");
        if(db.queryForList("SELECT id FROM feed_posts WHERE id=? FOR UPDATE",Long.class,id).isEmpty())throw new IllegalArgumentException("피드가 없습니다.");
        db.update("INSERT INTO feed_comments(feed_post_id,user_id,content) VALUES(?,?,?)",id,uid,content.trim());
        Long key=db.queryForObject("SELECT LAST_INSERT_ID()",Long.class);
        db.update("UPDATE feed_posts SET comments_count=comments_count+1 WHERE id=?",id);
        return FeedCommentResponse.builder().id(key).authorName(db.queryForObject("SELECT name FROM users WHERE id=?",String.class,uid)).content(content.trim()).build();
    }
}
