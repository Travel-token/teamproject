package com.example.travelapp.service;

import com.example.travelapp.domain.FeedLikeMapper;
import com.example.travelapp.domain.FeedPostMapper;
import com.example.travelapp.domain.FeedPostVO;
import com.example.travelapp.domain.PlaceMapper;
import com.example.travelapp.domain.PlaceVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final FeedPostMapper feedPostMapper;
    private final FeedLikeMapper feedLikeMapper;
    private final PlaceMapper placeMapper;

    public List<FeedPostVO> getFeeds(String sort, Double lat, Double lng) {
        return feedPostMapper.findAll(sort, lat, lng);
    }

    @Transactional
    public FeedPostVO getFeed(Long id) {
        feedPostMapper.incrementViewCount(id);
        return feedPostMapper.findById(id);
    }

    @Transactional
    public FeedPostVO createFeed(FeedPostVO feed) {
        PlaceVO place = placeMapper.findByApiContentId(feed.getApiContentId());
        if (place == null) {
            place = new PlaceVO();
            place.setApiContentId(feed.getApiContentId());
            place.setName(feed.getPlaceName());
            place.setAddr(feed.getAddr());
            place.setCategory(feed.getCategory());
            place.setLat(feed.getLat());
            place.setLng(feed.getLng());
            place.setThumbnailUrl(feed.getThumbnailUrl());
            placeMapper.insert(place);
        }

        feed.setPlaceId(place.getId());
        feedPostMapper.insert(feed);
        return feedPostMapper.findById(feed.getId());
    }

    public FeedPostVO updateFeed(Long id, FeedPostVO feed) {
        feed.setId(id);
        feedPostMapper.update(feed);
        return feedPostMapper.findById(id);
    }

    public void deleteFeed(Long id) {
        feedPostMapper.deleteById(id);
    }

    @Transactional
    public void like(Long feedId, Long userId) {
        if (!feedLikeMapper.exists(feedId, userId)) {
            feedLikeMapper.insert(feedId, userId);
            feedPostMapper.incrementLikeCount(feedId);
        }
    }

    @Transactional
    public void unlike(Long feedId, Long userId) {
        if (feedLikeMapper.exists(feedId, userId)) {
            feedLikeMapper.delete(feedId, userId);
            feedPostMapper.decrementLikeCount(feedId);
        }
    }
}
