import { api } from './client';
// FeedController 매핑  — 이건 마이페이지의 "내 피드"(api/mypage.ts)와는
// 다른, 전체 사용자 피드 화면용 엔드포인트):
//   GET    /feeds                 전체 피드 목록 (정렬/거리순 지원)
//   GET    /feeds/{id}            상세 (조회 시 viewCount 자동 증가)
//   POST   /feeds                 피드 생성
//   PUT    /feeds/{id}            피드 수정
//   DELETE /feeds/{id}            피드 삭제
//   POST   /feeds/{id}/like       좋아요
//   DELETE /feeds/{id}/like       좋아요 취소
//
// ⚠️ 좋아요 API는 userId를 쿼리 파라미터로 요구하는데, 현재 GET /api/users/me
// 응답(ProfileResponse)엔 유저 id가 내려오지 않아 프론트에서 내 userId를 구할 방법이
// 없습니다. 백엔드에 ProfileResponse.id 필드 추가(또는 JWT에서 자동 추출하도록 변경)를
// 요청하는 걸 추천드려요. 그 전까지는 아래처럼 userId를 호출부에서 직접 넘겨야 합니다.
export type FeedSort = 'popular' | 'latest' | 'distance';
// FeedPostVO와 동일한 모양
export interface FeedPost {
    photoUrls?: string[];
    id: number;
    userId: number;
    placeId: number;
    caption: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    popularityScore: number;
    createdAt: string;
    authorName: string;
    authorProfileImageUrl: string | null;
    likedByMe: boolean;
    apiContentId: string | null;
    placeName: string | null;
    addr: string | null;
    category: string | null;
    lat: number | null;
    lng: number | null;
    thumbnailUrl: string | null;
    distanceKm: number | null;
}
// 생성 요청 시엔 place 관련 필드로 "장소 지정"에 사용됨
export interface FeedCreatePayload {
    caption: string;
    placeId: number;
    apiContentId?: string;
    placeName: string;
    addr?: string;
    category?: string;
    lat?: number;
    lng?: number;
    thumbnailUrl?: string;
}
export interface FeedUpdatePayload {
    caption: string;
}
export async function fetchFeeds(params?: {
    sort?: FeedSort;
    lat?: number;
    lng?: number;
}): Promise<FeedPost[]> {
    const res = await api.get<FeedPost[]>('/feeds', { params });
    return res.data;
}
export async function fetchFeed(id: string | number): Promise<FeedPost> {
    const res = await api.get<FeedPost>(`/feeds/${id}`);
    return res.data;
}
export async function createFeed(payload: FeedCreatePayload): Promise<FeedPost> {
    const res = await api.post<FeedPost>('/feeds', payload);
    return res.data;
}
export async function updateFeed(id: string | number, payload: FeedUpdatePayload): Promise<FeedPost> {
    const res = await api.put<FeedPost>(`/feeds/${id}`, payload);
    return res.data;
}
export async function deleteFeed(id: string | number): Promise<void> {
    await api.delete(`/feeds/${id}`);
}
export async function likeFeed(id: string | number, userId: number): Promise<void> {
    await api.post(`/feeds/${id}/like`, null, { params: { userId } });
}
export async function unlikeFeed(id: string | number, userId: number): Promise<void> {
    await api.delete(`/feeds/${id}/like`, { params: { userId } });
}
