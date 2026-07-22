package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.Place_RequestDto;
import com.example.demo.dto.Place_ResponseDto;
import com.example.demo.repository.Place_repository;
import com.example.demo.repository.Trip_repository;
import com.example.demo.vo.Place_vo;

@Service
public class Place_serviceImpl implements Place_service {

    private final Place_repository placeRepository;
    private final Trip_repository tripRepository;

    public Place_serviceImpl(Place_repository placeRepository, Trip_repository tripRepository) {
        this.placeRepository = placeRepository;
        this.tripRepository = tripRepository;
    }

    @Override
    public Place_ResponseDto addPlace(Long tripId, Place_RequestDto request) {
        if (tripRepository.findById(tripId) == null) {
            throw new IllegalArgumentException("해당 여행이 존재하지 않습니다.");
        }
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