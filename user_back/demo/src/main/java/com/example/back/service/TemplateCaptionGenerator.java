package com.example.back.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back.vo.PlaceLog_vo;

/**
 * 템플릿 기반 캡션 생성기.
 * 외부 API 의존 없이 동선 데이터만으로 초안을 만든다. LLM 연동 전 기본 구현체.
 */
@Service
public class TemplateCaptionGenerator implements CaptionGenerator {

    @Override
    public String generate(String tripName, String region, List<PlaceLog_vo> placeLogs) {

        // ---------- ① 장소 이름과 메모 모으기 ----------
        List<String> placeNames = new ArrayList<>();
        String firstMemo = null;

        if (placeLogs != null) {
            for (PlaceLog_vo log : placeLogs) {
                if (log.getName() != null && !log.getName().isBlank()) {
                    placeNames.add(log.getName().trim());
                }
                // 메모가 있는 첫 기록을 "가장 인상 깊었던 순간"으로 활용
                if (firstMemo == null && log.getMemo() != null && !log.getMemo().isBlank()) {
                    firstMemo = log.getMemo().trim();
                }
            }
        }

        // ---------- ② 문장 조립 ----------
        StringBuilder sb = new StringBuilder();

        // 여는 문장: 여행 이름이 있으면 그대로, 없으면 지역으로
        if (tripName != null && !tripName.isBlank()) {
            sb.append(tripName.trim()).append(" 정산까지 깔끔하게 끝!");
        } else {
            sb.append(safeRegion(region)).append(" 여행 정산 완료!");
        }

        // 방문한 장소 소개 (최대 3곳까지만 — 너무 길면 읽기 힘듦)
        if (!placeNames.isEmpty()) {
            sb.append(" ");
            int limit = Math.min(placeNames.size(), 3);
            for (int i = 0; i < limit; i++) {
                sb.append(placeNames.get(i));
                if (i < limit - 1) {
                    sb.append(", ");
                }
            }
            if (placeNames.size() > 3) {
                sb.append(" 등 ").append(placeNames.size()).append("곳");
            }
            sb.append("을 다녀왔어요.");
        }

        // 메모가 있으면 감상 한 줄 추가
        if (firstMemo != null) {
            sb.append(" ").append(firstMemo).append("!");
        }

        // 해시태그: 지역 + 대표 장소
        sb.append(" #").append(safeRegion(region).replace(" ", ""));
        sb.append("여행");
        if (!placeNames.isEmpty()) {
            sb.append(" #").append(placeNames.get(0).replace(" ", ""));
        }
        sb.append(" #트래블토큰");

        return sb.toString();
    }

    @Override
    public String providerName() {
        return "template";   // LLM으로 교체하면 "anthropic" 등으로 바뀔 자리
    }

    @Override
    public String modelName() {
        return "rule-based-v1";
    }

    /** 지역이 비어 있어도 문장이 어색해지지 않게 기본값 처리 */
    private String safeRegion(String region) {
        return (region == null || region.isBlank()) ? "우리" : region.trim();
    }
}
