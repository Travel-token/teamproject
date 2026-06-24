import { apiClient } from './client';

// ============================================================
// 정산(Settlement) API
// Spring Boot 컨트롤러 예상 경로: /api/trips/{tripId}/settlement/**
// ============================================================

/** GET /api/trips/{tripId}/settlement - AI 분석 결과 + 최적 송금 경로 */
export async function fetchSettlement(tripId) {
  const { data } = await apiClient.get(`/trips/${tripId}/settlement`);
  return data;
}

/** POST /api/trips/{tripId}/settlement/complete */
export async function completeSettlement(tripId) {
  const { data } = await apiClient.post(`/trips/${tripId}/settlement/complete`);
  return data;
}

/** POST /api/trips/{tripId}/settlement/revert */
export async function revertSettlement(tripId) {
  const { data } = await apiClient.post(`/trips/${tripId}/settlement/revert`);
  return data;
}

/** POST /api/trips/{tripId}/settlement/nudge - 특정 멤버 또는 전체 독촉 알림 */
export async function nudgeSettlement(tripId, memberId = null) {
  const { data } = await apiClient.post(`/trips/${tripId}/settlement/nudge`, { memberId });
  return data;
}

/** POST /api/trips/{tripId}/settlement/members/{memberId}/confirm - 입금 확인 처리 */
export async function confirmMemberPayment(tripId, memberId) {
  const { data } = await apiClient.post(`/trips/${tripId}/settlement/members/${memberId}/confirm`);
  return data;
}

/**
 * POST /api/ai/chat - AI 정산 에이전트 채팅
 * body: { tripId, message }
 * response: { reply }
 */
export async function sendAIChatMessage(tripId, message) {
  const { data } = await apiClient.post('/ai/chat', { tripId, message });
  return data;
}
