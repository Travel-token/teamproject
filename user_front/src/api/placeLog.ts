import { api } from './client';

// ⚠️ NOTE: 이 파일은 trip.ts의 "동선(장소 기록)" 섹션과 기능이 중복됩니다.
// PlaceLog_controller 매핑 (실제 경로에는 /api 접두사가 붙습니다):
//   POST   /api/trips/{tripId}/places          동선(방문 장소) 추가
//   GET    /api/trips/{tripId}/places          동선 목록 (방문 시각 순)
//   DELETE /api/trips/{tripId}/places/{logId}  동선 삭제
//
// trip.ts에도 addPlaceLog / fetchPlaceLogs / deletePlaceLog가 동일한 이름으로
// 존재합니다. 두 파일을 동시에 import해서 쓰면 혼란스러우니, 가능하면 이 파일은
// 제거하고 trip.ts 쪽 구현(백엔드 응답과 필드가 100% 일치)으로 통일하는 걸 추천합니다.

// PlaceLog_RequestDto와 동일한 모양
export interface PlaceLogPayload {
    name: string;               // 필수
    memo?: string;
    visitedAt?: string;         // "yyyy-MM-dd HH:mm", 생략하면 서버가 현재 시각 사용
    placeId?: number;           // 관광공사 등록 장소를 선택한 경우만
    detectedByGps?: boolean;    // GPS 자동 감지 여부, 기본 false
}

// PlaceLog_ResponseDto와 동일한 모양
// (기존 버전엔 latitude/longitude/emoji가 빠져 있었음 — 백엔드 DTO 기준으로 보강)
export interface PlaceLogResponse {
    logId: number;
    tripId: number;
    placeId: number | null;
    name: string;
    memo: string | null;
    linkedExpenseId: number | null; // 지출과 연결된 경우만 값이 있음
    visitedAt: string;              // "2026-04-10 14:50:00"
    detectedByGps: boolean;
    latitude: number | null;        // 등록 장소가 아니면 null
    longitude: number | null;
    emoji: string | null;
}

export async function addPlaceLog(
    tripId: string | number,
    payload: PlaceLogPayload,
): Promise<PlaceLogResponse> {
    const res = await api.post<PlaceLogResponse>(`/api/trips/${tripId}/places`, payload);
    return res.data;
}

export async function fetchPlaceLogs(tripId: string | number): Promise<PlaceLogResponse[]> {
    const res = await api.get<PlaceLogResponse[]>(`/api/trips/${tripId}/places`);
    return res.data;
}

export async function deletePlaceLog(
    tripId: string | number,
    logId: string | number,
): Promise<void> {
    await api.delete(`/api/trips/${tripId}/places/${logId}`);
}