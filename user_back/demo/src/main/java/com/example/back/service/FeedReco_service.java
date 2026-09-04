package com.example.back.service;

import java.util.List;

import com.example.back.dto.FeedReco_GenerateRequestDto;
import com.example.back.dto.FeedReco_ResponseDto;
import com.example.back.dto.FeedReco_StatusRequestDto;

/**
 * ============================================================
 * 명세서의 "정산 완료 후 AI 글 추천" 기능이 할 수 있는 일 목록.
 * ============================================================
 */
public interface FeedReco_service {

    /** 정산 완료 시 추천 초안 생성 (여행 동선을 재료로 캡션 만들기) */
    FeedReco_ResponseDto generate(Long tripId, FeedReco_GenerateRequestDto request);

    /** 특정 사용자가 받은 추천 목록 */
    List<FeedReco_ResponseDto> getByUser(Long userId);

    /** 특정 여행에 대한 추천 목록 */
    List<FeedReco_ResponseDto> getByTrip(Long tripId);

    /** 추천 1건 조회 */
    FeedReco_ResponseDto getOne(Long recoId);

    /** 사용자가 채택/수정/무시했을 때 상태 기록 */
    FeedReco_ResponseDto changeStatus(Long recoId, FeedReco_StatusRequestDto request);

    /** 추천 삭제 */
    boolean delete(Long recoId);
}
