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
public class FeedReco_serviceImpl implements FeedReco_service {

    /** 로그인 연동 전 기본 사용자 id */
    private static final Long DEFAULT_USER_ID = 1L;

    private final FeedReco_repository recoRepository;
    private final Trip_repository tripRepository;
    private final PlaceLog_repository placeLogRepository;
    private final CaptionGenerator captionGenerator;

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
        reco.setTargetUserId(request.getTargetUserId() == null ? DEFAULT_USER_ID : request.getTargetUserId());
        reco.setSuggestedCaption(caption);
        reco.setStatus(RecommendationStatus.PENDING);
        reco.setLlmProvider(captionGenerator.providerName());
        reco.setLlmModel(captionGenerator.modelName());

        recoRepository.insertReco(reco);

        return FeedReco_ResponseDto.from(recoRepository.findById(reco.getId()));
    }

    @Override
    public List<FeedReco_ResponseDto> getByUser(Long userId) {
        return toDtoList(recoRepository.findByUserId(userId));
    }

    @Override
    public List<FeedReco_ResponseDto> getByTrip(Long tripId) {
        return toDtoList(recoRepository.findByTripId(tripId));
    }

    @Override
    public FeedReco_ResponseDto getOne(Long recoId) {
        FeedRecommendationVo vo = recoRepository.findById(recoId);
        if (vo == null) {
            throw new IllegalArgumentException("해당 추천이 존재하지 않습니다.");
        }
        return FeedReco_ResponseDto.from(vo);
    }

    @Override
    public FeedReco_ResponseDto changeStatus(Long recoId, FeedReco_StatusRequestDto request) {
        String status = request.getStatus();

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
        return recoRepository.deleteReco(recoId) > 0;
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
