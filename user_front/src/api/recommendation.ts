import { api } from './client';

/**
 * AI 피드 추천 API
 * 정산 완료 후 서버가 생성한 피드 글 초안을 조회/채택/무시한다.
 */

/** 서버 응답 (FeedReco_ResponseDto와 1:1) */
export interface ServerReco {
  recommendationId: number;
  settlementId: number;
  tripId: number;
  placeId: number | null;
  targetUserId: number;
  suggestedCaption: string;
  status: 'pending' | 'adopted' | 'edited' | 'dismissed';
  adoptedFeedPostId: number | null;
  createdAt: string;
}

/** 화면에서 쓰는 추천 항목 */
export interface RecoItem {
  id: string;
  caption: string;
  status: ServerReco['status'];
  tripId: number;
  placeId: number | null;
}

/** 서버 → 화면 변환 */
export function toRecoItem(s: ServerReco): RecoItem {
  return {
    id: String(s.recommendationId),
    caption: s.suggestedCaption,
    status: s.status,
    tripId: s.tripId,
    placeId: s.placeId,
  };
}

/** POST /api/recommendations/trips/{tripId} - 추천 생성 (정산 완료 시) */
export async function generateRecommendation(
  tripId: string,
  settlementId: number,
  targetUserId?: number
): Promise<RecoItem> {
  const res = await api.post<ServerReco>(`/recommendations/trips/${tripId}`, {
    settlementId,
    targetUserId,
  });
  return toRecoItem(res.data);
}

/** GET /api/recommendations?userId= - 내 추천 목록 */
export async function fetchMyRecommendations(userId?: number): Promise<RecoItem[]> {
  const res = await api.get<ServerReco[]>('/recommendations', {
    params: userId ? { userId } : undefined,
  });
  return Array.isArray(res.data) ? res.data.map(toRecoItem) : [];
}

/** GET /api/recommendations/trips/{tripId} - 특정 여행의 추천 목록 */
export async function fetchTripRecommendations(tripId: string): Promise<RecoItem[]> {
  const res = await api.get<ServerReco[]>(`/recommendations/trips/${tripId}`);
  return Array.isArray(res.data) ? res.data.map(toRecoItem) : [];
}

/** PATCH /api/recommendations/{id} - 채택/수정/무시 처리 */
export async function updateRecommendationStatus(
  recoId: string,
  status: 'adopted' | 'edited' | 'dismissed',
  adoptedFeedPostId?: number
): Promise<RecoItem> {
  const res = await api.patch<ServerReco>(`/recommendations/${recoId}`, {
    status,
    adoptedFeedPostId,
  });
  return toRecoItem(res.data);
}

/** DELETE /api/recommendations/{id} */
export async function deleteRecommendation(recoId: string): Promise<void> {
  await api.delete(`/recommendations/${recoId}`);
}
