import { apiClient } from './client';

// ============================================================
// 여행(Trip) / 지출(Expense) API
// Spring Boot 컨트롤러 예상 경로: /api/trips/**, /api/expenses/**
// ============================================================

/** GET /api/trips/active - 현재 진행 중인 여행 1건 */
export async function fetchActiveTrip() {
  const { data } = await apiClient.get('/trips/active');
  return data;
}

/** GET /api/trips?status=ended - 종료된 여행 목록 */
export async function fetchPastTrips() {
  const { data } = await apiClient.get('/trips', { params: { status: 'ended' } });
  return data;
}

/**
 * POST /api/trips
 * body: { name, startDate, endDate, budget, currency, memberIds }
 */
export async function createTrip(payload) {
  const { data } = await apiClient.post('/trips', payload);
  return data;
}

/** PATCH /api/trips/{tripId} - 이름/날짜/예산/통화 수정 */
export async function updateTrip(tripId, payload) {
  const { data } = await apiClient.patch(`/trips/${tripId}`, payload);
  return data;
}

/** DELETE /api/trips/{tripId} */
export async function deleteTrip(tripId) {
  const { data } = await apiClient.delete(`/trips/${tripId}`);
  return data;
}

/** POST /api/trips/{tripId}/save - 종료된 여행을 보관함으로 저장 */
export async function archiveTrip(tripId) {
  const { data } = await apiClient.post(`/trips/${tripId}/save`);
  return data;
}

/** POST /api/trips/{tripId}/members - 멤버 추가 (닉네임/이메일) */
export async function addTripMember(tripId, identifier) {
  const { data } = await apiClient.post(`/trips/${tripId}/members`, { identifier });
  return data;
}

/** DELETE /api/trips/{tripId}/members/{memberId} - 강퇴 */
export async function removeTripMember(tripId, memberId) {
  const { data } = await apiClient.delete(`/trips/${tripId}/members/${memberId}`);
  return data;
}

/** GET /api/trips/{tripId}/invite-code - 초대 코드 조회 */
export async function fetchInviteCode(tripId) {
  const { data } = await apiClient.get(`/trips/${tripId}/invite-code`);
  return data;
}

/** POST /api/trips/join - 초대 코드로 참여 */
export async function joinTripByCode(code) {
  const { data } = await apiClient.post('/trips/join', { code });
  return data;
}

// ------------------------------------------------------------
// 지출
// ------------------------------------------------------------

/** GET /api/trips/{tripId}/expenses */
export async function fetchExpenses(tripId, params) {
  const { data } = await apiClient.get(`/trips/${tripId}/expenses`, { params });
  return data;
}

/**
 * POST /api/trips/{tripId}/expenses
 * body: { name, amount, category, payerId, splitType, ratios? }
 */
export async function createExpense(tripId, payload) {
  const { data } = await apiClient.post(`/trips/${tripId}/expenses`, payload);
  return data;
}

/** POST /api/trips/{tripId}/expenses/ocr - 영수증 이미지 업로드 → OCR 인식 결과 */
export async function uploadReceiptOCR(tripId, formData) {
  const { data } = await apiClient.post(`/trips/${tripId}/expenses/ocr`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** POST /api/trips/{tripId}/places - 지출 없이 방문 장소만 기록 */
export async function addPlaceLog(tripId, payload) {
  const { data } = await apiClient.post(`/trips/${tripId}/places`, payload);
  return data;
}

/** POST /api/trips/{tripId}/transfers - 멤버 간 송금 기록 */
export async function createTransfer(tripId, payload) {
  const { data } = await apiClient.post(`/trips/${tripId}/transfers`, payload);
  return data;
}

/** GET /api/trips/{tripId}/route - 여행 동선(GPS 로그) */
export async function fetchTripRoute(tripId) {
  const { data } = await apiClient.get(`/trips/${tripId}/route`);
  return data;
}
