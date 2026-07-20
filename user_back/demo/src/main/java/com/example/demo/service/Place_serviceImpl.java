package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.Place_RequestDto;
import com.example.demo.dto.Place_ResponseDto;
import com.example.demo.repository.Place_repository;
import com.example.demo.repository.Trip_repository;
import com.example.demo.vo.Place_vo;

// ============================================================
// Place_serviceImpl : 장소 요리사 본체
// 특이점: 창고지기를 "둘" 데리고 있음 (Place + Trip)
//   → 장소를 넣기 전에 "부모 방이 실존하는지"를 Trip 창고지기에게 확인
// ============================================================
@Service
public class Place_serviceImpl implements Place_service {

    private final Place_repository placeRepository;
    private final Trip_repository tripRepository;

    // 생성자 주입: Spring이 창고지기 둘을 모두 데려와 연결
    public Place_serviceImpl(Place_repository placeRepository, Trip_repository tripRepository) {
        this.placeRepository = placeRepository;
        this.tripRepository = tripRepository;
    }

    @Override
    public Place_ResponseDto addPlace(Long tripId, Place_RequestDto request) {
        // 문지기 ①: 부모 방이 실존하는지 (없는 방에 장소를 달 수 없음)
        if (tripRepository.findById(tripId) == null) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }
        // 문지기 ②: 장소명은 필수 (명세서 k-1)
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("장소명은 필수입니다.");
        }

        Place_vo place = new Place_vo();
        place.setTrip_id(tripId);
        place.setName(request.getName().trim());
        place.setVisit_time(request.getVisitTime());
        place.setMemo(request.getMemo());

        placeRepository.insertPlace(place);
        // insert 후 place.getPlace_id()에 새 번호가 채워져 있으므로 그대로 답장
        return Place_ResponseDto.from(placeRepository.findByTripId(tripId)
                .stream().filter(p -> p.getPlace_id().equals(place.getPlace_id()))
                .findFirst().orElse(place));
    }

    @Override
    public List<Place_ResponseDto> getPlaces(Long tripId) {
        List<Place_ResponseDto> result = new ArrayList<>();
        for (Place_vo vo : placeRepository.findByTripId(tripId)) {
            result.add(Place_ResponseDto.from(vo));
        }
        return result;
    }

    @Override
    public boolean deletePlace(Long placeId) {
        return placeRepository.deletePlace(placeId) > 0;
    }
}