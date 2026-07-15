import { apiClient } from './client';

// ============================================================
// 여행(Trip) / 지출(Expense) API
// Spring Boot 컨트롤러 예상 경로: /api/trips/**, /api/expenses/**
//
// [g 단계에서 바뀐 것]
// fetchActiveTrip이 "번역기(toFrontTrip)"를 거치도록 수정.
// 서버의 답장(tripId, createdAt...)과 화면이 기대하는 모양(id, nights...)이
// 달라서, 우체국에서 받자마자 화면용으로 번역해 전달합니다.
// ============================================================

/**
 * [NEW] 번역기: 서버 Trip_ResponseDto → 화면용 trip 객체
 * 서버가 주는 것:  { tripId, name, emoji, region, startDate, endDate, budget, currency, status, createdAt }
 * 화면이 원하는 것: { id, name, emoji, region, startDate, endDate, nights, budget, status, members, ... }
 */
function toFrontTrip(data) {
  if (!data || !data.tripId) return null; // 내용 없으면 "없음"으로

  // 박(nights) 계산: (종료일 - 시작일)을 일수로 환산
  const nights =
      data.startDate && data.endDate
          ? Math.round((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24))
          : 0;

  return {
    id: String(data.tripId),          // 서버의 tripId → 화면의 id
    name: data.name,
    emoji: data.emoji || '✈️',
    status: data.status || 'ongoing',
    startDate: data.startDate,
    endDate: data.endDate,
    nights,
    region: data.region || '미지정',
    budget: data.budget || 0,
    currency: data.currency || 'KRW',
    // 아래 값들은 아직 서버에 없는 정보라 기본값으로 채움
    // (멤버는 회원 시스템(박찬민 담당) 연동 후, 지출 합계는 지출 API(권소희 담당) 연동 후 채워짐)
    members: [],
    placesVisited: 0,
    totalSpent: 0,
    highlightPlaces: [],
  };
}

/** GET /api/trips/active - 현재 진행 중인 여행 1건 */
export async function fetchActiveTrip() {
  const { data } = await apiClient.get('/trips/active');
  // 서버가 204(내용 없음)를 주면 data는 빈 값 → 번역기가 null로 처리
  return toFrontTrip(data);
}

/** GET /api/trips?status=ended - 종료된 여행 목록 */
export async function fetchPastTrips() {
  const { data } = await apiClient.get('/trips', { params: { status: 'ended' } });
  return data;
}

/**
 * POST /api/trips
 * body: { name, emoji, region, startDate, endDate, budget, currency }
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
