package com.example.back.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back.dto.FeedReco_GenerateRequestDto;
import com.example.back.dto.FeedReco_ResponseDto;
import com.example.back.dto.FeedReco_StatusRequestDto;
import com.example.back.repository.FeedReco_repository;
import com.example.back.repository.PlaceLog_repository;
import com.example.back.repository.Trip_repository;
import com.example.back.vo.PlaceLog_vo;
import com.example.back.vo.Trip_vo;
import com.example.back.vo.enums.RecommendationStatus;
import com.example.back.vo.recommendation.FeedRecommendationVo;

@Service
@org.springframework.transaction.annotation.Transactional
public class FeedReco_serviceImpl implements FeedReco_service {

    /** 로그인 연동 전 기본 사용자 id */
    private static final Long DEFAULT_USER_ID = 1L;

    private final FeedReco_repository recoRepository;
    private final Trip_repository tripRepository;
    private final PlaceLog_repository placeLogRepository;
    private final CaptionGenerator captionGenerator;
    @org.springframework.beans.factory.annotation.Autowired private TripAccess access;
    @org.springframework.beans.factory.annotation.Autowired private org.springframework.jdbc.core.JdbcTemplate db;
    @org.springframework.beans.factory.annotation.Autowired private UserService users;

    public FeedReco_serviceImpl(FeedReco_repository recoRepository,
                                Trip_repository tripRepository,
                                PlaceLog_repository placeLogRepository,
                                CaptionGenerator captionGenerator) {
        this.recoRepository = recoRepository;
        this.tripRepository = tripRepository;
        this.placeLogRepository = placeLogRepository;
        this.captionGenerator = captionGenerator;
    }

    @Override
    public FeedReco_ResponseDto generate(Long tripId, FeedReco_GenerateRequestDto request) {

        access.lock(tripId);
        if(request.getSettlementId()==null || db.queryForObject("SELECT COUNT(*) FROM settlements WHERE id=? AND trip_id=? AND status='completed'",Integer.class,request.getSettlementId(),tripId)==0)throw new IllegalArgumentException("완료된 정산이 필요합니다.");
        var existing=recoRepository.findByTripId(tripId).stream().filter(x->x.getTargetUserId().equals(access.userId()) && x.getSettlementId().equals(request.getSettlementId())).findFirst();
        if(existing.isPresent())return FeedReco_ResponseDto.from(existing.get());
        Trip_vo trip = tripRepository.findById(tripId);
        if (trip == null) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }
        if (request.getSettlementId() == null) {
            throw new IllegalArgumentException("settlementId는 필수입니다.");
        }

        List<PlaceLog_vo> logs = placeLogRepository.findByTripId(tripId);
        String caption = captionGenerator.generate(trip.getName(), trip.getRegion(), logs);

        FeedRecommendationVo reco = new FeedRecommendationVo();
        reco.setSettlementId(request.getSettlementId());
        reco.setTripId(tripId);
        reco.setPlaceId(resolveRepresentativePlaceId(logs));
        reco.setTargetUserId(access.userId());
        reco.setSuggestedCaption(caption);
        reco.setStatus(RecommendationStatus.PENDING);
        reco.setLlmProvider(captionGenerator.providerName());
        reco.setLlmModel(captionGenerator.modelName());

        recoRepository.insertReco(reco);

        return FeedReco_ResponseDto.from(recoRepository.findById(reco.getId()));
    }

    @Override
    public List<FeedReco_ResponseDto> getByUser(Long userId) {
        return toDtoList(recoRepository.findByUserId(access.userId()));
    }

    @Override
    public List<FeedReco_ResponseDto> getByTrip(Long tripId) {
        access.member(tripId);
        return toDtoList(recoRepository.findByTripId(tripId).stream().filter(x->x.getTargetUserId().equals(access.userId())).toList());
    }

    @Override
    public FeedReco_ResponseDto getOne(Long recoId) {
        FeedRecommendationVo vo = recoRepository.findById(recoId);
        if (vo == null) {
            throw new IllegalArgumentException("해당 추천이 존재하지 않습니다.");
        }
        if(!vo.getTargetUserId().equals(access.userId()))throw new IllegalArgumentException("본인의 추천만 볼 수 있습니다.");
        return FeedReco_ResponseDto.from(vo);
    }

    @Override
    public FeedReco_ResponseDto changeStatus(Long recoId, FeedReco_StatusRequestDto request) {
        getOne(recoId);
        String status = request.getStatus();
        if(!"dismissed".equals(status))throw new IllegalArgumentException("피드 만들기는 채택 API를 사용해 주세요.");

        if (!"pending".equals(status) && !"adopted".equals(status)
                && !"edited".equals(status) && !"dismissed".equals(status)) {
            throw new IllegalArgumentException("status는 pending / adopted / edited / dismissed 만 가능합니다.");
        }

        int updated = recoRepository.updateStatus(recoId, status, request.getAdoptedFeedPostId());
        if (updated == 0) {
            throw new IllegalArgumentException("해당 추천이 존재하지 않습니다.");
        }
        return FeedReco_ResponseDto.from(recoRepository.findById(recoId));
    }

    @Override
    public boolean delete(Long recoId) {
        getOne(recoId);
        return recoRepository.deleteReco(recoId) > 0;
    }

    public java.util.Map<String,Object> adopt(Long id,String caption,Long selectedPlaceId){
        db.queryForObject("SELECT id FROM feed_recommendations WHERE id=? FOR UPDATE",Long.class,id);
        var dto=getOne(id);
        if(dto.getAdoptedFeedPostId()!=null)return java.util.Map.of("recommendationId",id,"status","adopted","feedPostId",dto.getAdoptedFeedPostId());
        if(!"pending".equals(dto.getStatus()))throw new IllegalArgumentException("처리 가능한 추천이 아닙니다.");
        Long placeId=selectedPlaceId==null?dto.getPlaceId():selectedPlaceId;
        if(placeId==null)throw new IllegalArgumentException("동선에 등록된 장소가 없습니다. 피드 작성에서 장소를 선택해 주세요.");
        var request=new com.example.back.dto.FeedCreateRequest();request.setPlaceId(placeId);request.setCaption(caption==null?dto.getSuggestedCaption():caption);
        // Trip images remain private; explicit feed uploads may be added by the user.
        request.setPhotoUrls(java.util.List.of());
        var feed=users.createMyFeed(access.userId(),request);
        recoRepository.updateStatus(id,"adopted",feed.getId());
        return java.util.Map.of("recommendationId",id,"status","adopted","feedPostId",feed.getId());
    }
    /** 동선 중 places 테이블과 연결된 첫 번째 장소를 대표 장소로 사용 */
    private Long resolveRepresentativePlaceId(List<PlaceLog_vo> logs) {
        for (PlaceLog_vo log : logs) {
            if (log.getPlace_id() != null) {
                return log.getPlace_id();
            }
        }
        return null;
    }

    private List<FeedReco_ResponseDto> toDtoList(List<FeedRecommendationVo> voList) {
        List<FeedReco_ResponseDto> result = new ArrayList<>();
        for (FeedRecommendationVo vo : voList) {
            result.add(FeedReco_ResponseDto.from(vo));
        }
        return result;
    }
}
