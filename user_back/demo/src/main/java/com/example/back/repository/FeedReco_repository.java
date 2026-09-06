package com.example.back.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.back.vo.recommendation.FeedRecommendationVo;

/**
 * ============================================================
 * FeedReco_repository : AI 피드 추천
 * ============================================================
 */
@Mapper
public interface FeedReco_repository {

    /** 추천 1건 저장. 저장 후 vo.getId()에 발급된 번호가 채워진다 */
    int insertReco(FeedRecommendationVo reco);

    /** 추천 1건 조회 */
    FeedRecommendationVo findById(Long id);

    /** 특정 사용자의 추천 목록 (최신순) */
    List<FeedRecommendationVo> findByUserId(Long target_user_id);

    /** 특정 여행의 추천 목록 (최신순) */
    List<FeedRecommendationVo> findByTripId(Long trip_id);

    /**
     * 상태 변경 (채택/수정/무시).
     * 파라미터가 3개라서 @Param("이름표")로 각각 이름을 붙여준다.
     * → XML의 #{id}, #{status}, #{adopted_feed_post_id}가 누구인지 알려주는 표시.
     */
    int updateStatus(@Param("id") Long id,
                     @Param("status") String status,
                     @Param("adopted_feed_post_id") Long adopted_feed_post_id);

    /** 추천 삭제 */
    int deleteReco(Long id);
}
