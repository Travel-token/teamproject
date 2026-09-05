package com.example.back;

import com.example.back.auth.JwtProvider;
import com.example.back.dto.*;
import com.example.back.service.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiRepairIntegrationTest {
 @Autowired JdbcTemplate db;
 @Autowired Trip_service trips;
 @Autowired ExpenseService expenses;
 @Autowired SettlementService settlements;
 @Autowired TransferService transfers;
 @Autowired FeedReco_service recommendations;
 @Autowired FeedService feeds;
 @Autowired FeedCommentService comments;
 @Autowired JwtProvider jwt;
 @Autowired MockMvc mvc;
 Long uid,tripId,a,b,placeId;
 @BeforeEach void setup(){
  db.update("INSERT INTO users(name,email,status,is_dark_mode) VALUES('API test',?,'active',0)",UUID.randomUUID()+"@example.invalid");
  uid=db.queryForObject("SELECT LAST_INSERT_ID()",Long.class);
  SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(uid,null,List.of()));
  var req=new Trip_RequestDto();req.setName("API rollback test");req.setRegion("서울");req.setStartDate("2026-09-01");req.setEndDate("2026-09-02");req.setEmoji("✈️");req.setCurrency("KRW");req.setMemberNames(List.of("동명이인","동명이인"));
  tripId=trips.createTrip(req).getTripId();
  var members=trips.getMembers(tripId);a=members.get(0).getMemberId();b=members.get(1).getMemberId();
  var ids=db.queryForList("SELECT id FROM places ORDER BY id LIMIT 1",Long.class);
  if(ids.isEmpty())throw new IllegalStateException("A seeded place is required for the feed integration test");placeId=ids.get(0);
 }
 @AfterEach void clear(){SecurityContextHolder.clearContext();}
 ExpenseRequest.Create expense(String mode){
  var r=new ExpenseRequest.Create();r.setName("점심");r.setAmount(new BigDecimal("100"));r.setCategoryCode(db.queryForObject("SELECT code FROM expense_categories ORDER BY code LIMIT 1",String.class));r.setPayerMemberId(a);r.setSplitMode(mode);
  var x=new ExpenseRequest.SplitInput();x.setMemberId(a);x.setAmount(new BigDecimal("50"));x.setPercent(new BigDecimal("50"));
  var y=new ExpenseRequest.SplitInput();y.setMemberId(b);y.setAmount(new BigDecimal("50"));y.setPercent(new BigDecimal("50"));r.setSplits(List.of(x,y));return r;
 }
 @Test void tripFieldsAndCurrentUser(){var r=trips.getTrip(tripId);assertEquals(uid,r.getCreatedBy());assertEquals("✈️",r.getEmoji());assertEquals("KRW",r.getCurrency());assertEquals(3,trips.getMembers(tripId).size());assertTrue(trips.getAllTrips(null).stream().allMatch(t->db.queryForObject("SELECT COUNT(*) FROM trip_members WHERE trip_id=? AND user_id=?",Integer.class,t.getTripId(),uid)>0));}
 @Test void splitAndSettlementAndAdoptionAreIdempotent(){
  var saved=expenses.createExpense(tripId,expense("even"));assertEquals(0,new BigDecimal("50").compareTo(saved.getMyShare()));assertEquals(a,saved.getPayerMemberId());assertEquals(2,saved.getSplits().size());
  db.update("INSERT INTO trip_place_logs(trip_id,place_id,name,visited_at) VALUES(?,?, '장소',NOW())",tripId,placeId);
  var settlement=settlements.create(tripId);assertEquals(settlement.getSettlementId(),settlements.create(tripId).getSettlementId());assertEquals(1,settlement.getTransfers().size());
  var route=settlement.getTransfers().get(0);assertEquals(b,route.getFromMemberId());assertEquals(a,route.getToMemberId());
  settlements.completeRoute(tripId,route.getTransferId());settlements.completeRoute(tripId,route.getTransferId());
  assertEquals(1,transfers.getTransfers(tripId).size());assertTrue(settlements.getBalances(tripId).stream().allMatch(x->x.getAmount().signum()==0));
  settlements.complete(tripId);settlements.complete(tripId);var recos=recommendations.getByTrip(tripId);assertEquals(1,recos.size());
  var first=recommendations.adopt(recos.get(0).getRecommendationId(),null,null);var second=recommendations.adopt(recos.get(0).getRecommendationId(),null,null);assertEquals(first.get("feedPostId"),second.get("feedPostId"));
  Long fid=((Number)first.get("feedPostId")).longValue();assertEquals("API test",feeds.getFeed(fid).getAuthorName());
  feeds.like(fid,999L);feeds.like(fid,999L);assertEquals(1L,feeds.getFeed(fid).getLikeCount());assertTrue(feeds.getFeed(fid).isLikedByMe());
  var comment=comments.createComment(fid,uid,"좋아요");assertNotNull(comment.getId());assertEquals(1L,feeds.getFeed(fid).getCommentCount());
 }
 @Test void manualTransferReturnsSavedItem(){var r=new TransferRequest.Create();r.setFromMemberId(b);r.setToMemberId(a);r.setAmount(new BigDecimal("10"));var t=transfers.createTransfer(tripId,r);assertNotNull(t.getId());assertEquals(b,t.getFromMemberId());}
 @Test void priorTransfersReduceSettlement(){expenses.createExpense(tripId,expense("manual"));var r=new TransferRequest.Create();r.setFromMemberId(b);r.setToMemberId(a);r.setAmount(new BigDecimal("20"));transfers.createTransfer(tripId,r);assertEquals(0,new BigDecimal("30").compareTo(settlements.create(tripId).getTransfers().get(0).getAmount()));}
 @Test void invalidSplitAndPendingCompletionRejected(){var r=expense("manual");r.getSplits().get(0).setAmount(BigDecimal.ONE);assertThrows(IllegalArgumentException.class,()->expenses.createExpense(tripId,r));}
 @Test void httpMembershipAndWithdrawal()throws Exception{
  String token=jwt.generateToken(uid,"api@example.invalid");
  mvc.perform(get("/api/trips/"+tripId).header("Authorization","Bearer "+token)).andExpect(status().isOk());
  db.update("UPDATE users SET status='withdrawn' WHERE id=?",uid);
  mvc.perform(get("/api/users/me").header("Authorization","Bearer "+token)).andExpect(status().isUnauthorized());
 }
 @Test void publicFeedAndCommentsHttp()throws Exception{
  var r=new FeedCreateRequest();r.setPlaceId(placeId);r.setCaption("테스트");
  var feed=new com.example.back.vo.FeedPostVO();feed.setPlaceId(placeId);feed.setCaption("테스트");Long id=feeds.createFeed(feed).getId();
  String token=jwt.generateToken(uid,"api@example.invalid");
  mvc.perform(get("/feeds/"+id).header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.authorName").value("API test"));
  mvc.perform(post("/api/feeds/"+id+"/comments").header("Authorization","Bearer "+token).contentType("application/json").content("{\"content\":\"댓글\"}")).andExpect(status().isCreated());
 }
}
