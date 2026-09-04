import { api } from './client';

// PlaceLog_controller 매핑:
//   POST   /trips/{tripId}/places          동선(방문 장소) 추가
//   GET    /trips/{tripId}/places          동선 목록 (방문 시각 순)
//   DELETE /trips/{tripId}/places/{logId}  동선 삭제

// PlaceLog_RequestDto와 동일한 모양
export interface PlaceLogPayload {
    name: string;               // 필수
    memo?: string;
    visitedAt?: string;         // "yyyy-MM-dd HH:mm", 생략하면 서버가 현재 시각 사용
    placeId?: number;           // 관광공사 등록 장소를 선택한 경우만
    detectedByGps?: boolean;    // GPS 자동 감지 여부, 기본 false
}

// PlaceLog_ResponseDto와 동일한 모양
export interface PlaceLogResponse {
    logId: number;
    tripId: number;
    placeId: number | null;
    name: string;
    memo: string | null;
    linkedExpenseId: number | null; // 지출과 연결된 경우만 값이 있음
    visitedAt: string;              // "2026-04-10 14:50:00"
    detectedByGps: boolean;
}

export async function addPlaceLog(
    tripId: string | number,
    payload: PlaceLogPayload,
): Promise<PlaceLogResponse> {
    const res = await api.post<PlaceLogResponse>(`/trips/${tripId}/places`, payload);
    return res.data;
}

export async function fetchPlaceLogs(tripId: string | number): Promise<PlaceLogResponse[]> {
    const res = await api.get<PlaceLogResponse[]>(`/trips/${tripId}/places`);
    return res.data;
}

export async function deletePlaceLog(
    tripId: string | number,
    logId: string | number,
): Promise<void> {
    await api.delete(`/trips/${tripId}/places/${logId}`);
}