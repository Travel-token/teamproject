package com.example.back.common.logger;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BehaviorLogService {
    private static final Logger behaviorLogger = LoggerFactory.getLogger("BEHAVIOR");

    // 피드 조회
    public void feedview(Long userId, Long feedId) {
        behaviorLogger.info(
                createLog(
                        userId,
                        "FEED_VIEW",
                        feedId));

    }

    // 피드 좋아요
    public void feedLike(Long userId, Long feedId) {
        behaviorLogger.info(
                createLog(
                        userId,
                        "FEED_LIKE",
                        feedId));

    }

    // 피드 클릭
    public void feedClick(Long userId, Long feedId) {
        behaviorLogger.info(
                createLog(
                        userId,
                        "FEED_CLICK",
                        feedId));

    }

    private String createLog(
            Long userId,
            String event,
            Long feedId) {

        return String.format(
                "{\"timestamp\":\"%s\",\"userId\":%d,\"event\":\"%s\",\"feedId\":%d}",
                LocalDateTime.now(),
                userId,
                event,
                feedId);
    }

}
