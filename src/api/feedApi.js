import { apiClient } from './client';

// ============================================================
// 피드(Feed) API
// Spring Boot 컨트롤러 예상 경로: /api/feed/**, /api/places/**
// ============================================================

/**
 * GET /api/feed?sort=near|popular|recent&lat=&lng=
 * 정렬 기준과 GPS 좌표를 함께 전달합니다.
 */
export async function fetchFeed({ sort, latitude, longitude }) {
  const { data } = await apiClient.get('/feed', { params: { sort, latitude, longitude } });
  return data;
}

/** GET /api/feed/{postId} */
export async function fetchFeedDetail(postId) {
  const { data } = await apiClient.get(`/feed/${postId}`);
  return data;
}

/** POST /api/feed/{postId}/like, DELETE 취소 */
export async function toggleFeedLike(postId, liked) {
  if (liked) {
    const { data } = await apiClient.post(`/feed/${postId}/like`);
    return data;
  }
  const { data } = await apiClient.delete(`/feed/${postId}/like`);
  return data;
}

/** GET /api/places/search?query= - 한국관광공사 API 연동 검색 (백엔드에서 프록시) */
export async function searchPlaces(query) {
  const { data } = await apiClient.get('/places/search', { params: { query } });
  return data;
}

/**
 * POST /api/feed
 * multipart: { placeId, caption, images[] }
 */
export async function publishFeedPost(formData) {
  const { data } = await apiClient.post('/feed', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
