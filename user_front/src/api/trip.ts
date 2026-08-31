import { api } from './client';

// Trip_controller 매핑:
//   POST   /trips                       여행 만들기
//   GET    /trips?status=               목록 (상태 필터)
//   GET    /trips/active                진행중 1건 (앱 복원용)
//   GET    /trips/{tripId}              단건 조회
//   PATCH  /trips/{tripId}              수정
//   DELETE /trips/{tripId}              삭제
//   POST   /trips/{tripId}/complete     여행 종료
//   GET    /trips/{tripId}/invite-code  초대 코드 조회
//   GET    /trips/{tripId}/members      멤버 목록
//   POST   /trips/{tripId}/members      멤버 추가
//   DELETE /trips/{tripId}/members/{memberId}  멤버 삭제
//
// 주의: /api prefix 없음 (client.ts의 baseURL도 /api 없이 세팅되어 있어야 함)

export type TripStatus = 'planned' | 'ongoing' | 'completed';

// Trip_RequestDto와 동일한 모양
export interface TripCreatePayload {
    name: string;
    region: string;
    startDate: string; // "yyyy-MM-dd"
    endDate: string;   // "yyyy-MM-dd"
    budget?: number;
    createdBy?: number;   // 로그인 연동 전까지는 생략 가능 (서버가 시드 유저로 대체)
    creatorName?: string; // 생략하면 서버가 "방장"으로 등록
}

export type TripUpdatePayload = Partial<TripCreatePayload>;

// Trip_ResponseDto와 동일한 모양
export interface TripResponse {
    tripId: number;
    name: string;
    region: string;
    startDate: string;
    endDate: string;
    budget: number | null;
    inviteCode: string;
    status: TripStatus;
    createdBy: number;
    createdAt: string;
}

// TripMember_ResponseDto와 동일한 모양
export interface TripMemberResponse {
    memberId: number;
    tripId: number;
    userId: number | null;
    displayName: string;
    shortName: string;
    colorCode: string;
    role: 'owner' | 'member';
}

// TripMember_RequestDto와 동일한 모양
export interface TripMemberPayload {
    displayName: string;
    colorCode?: string; // 안 보내면 서버 기본값(tp) 사용
    userId?: number;    // 가입 회원을 연결할 때만
}

export async function createTrip(payload: TripCreatePayload): Promise<TripResponse> {
    const res = await api.post<TripResponse>('/trips', payload);
    return res.data;
}

export async function fetchTrips(status?: TripStatus): Promise<TripResponse[]> {
    const res = await api.get<TripResponse[]>('/trips', {
        params: status ? { status } : undefined,
    });
    return res.data;
}

// 진행중인 여행이 없으면 서버가 204 No Content를 내려준다 → null로 변환
export async function fetchActiveTrip(): Promise<TripResponse | null> {
    const res = await api.get<TripResponse | ''>('/trips/active', {
        validateStatus: (status) => status === 200 || status === 204,
    });
    return res.status === 204 ? null : (res.data as TripResponse);
}

export async function fetchTrip(tripId: string | number): Promise<TripResponse> {
    const res = await api.get<TripResponse>(`/trips/${tripId}`);
    return res.data;
}

export async function updateTrip(
    tripId: string | number,
    payload: TripUpdatePayload,
): Promise<TripResponse> {
    const res = await api.patch<TripResponse>(`/trips/${tripId}`, payload);
    return res.data;
}

export async function deleteTrip(tripId: string | number): Promise<void> {
    await api.delete(`/trips/${tripId}`);
}

// "정산 끝내기" 등에서 호출 → status가 completed로 바뀐다
export async function completeTrip(tripId: string | number): Promise<TripResponse> {
    const res = await api.post<TripResponse>(`/trips/${tripId}/complete`);
    return res.data;
}

export async function fetchInviteCode(tripId: string | number): Promise<string> {
    const res = await api.get<{ inviteCode: string }>(`/trips/${tripId}/invite-code`);
    return res.data.inviteCode;
}

export async function fetchTripMembers(tripId: string | number): Promise<TripMemberResponse[]> {
    const res = await api.get<TripMemberResponse[]>(`/trips/${tripId}/members`);
    return res.data;
}

export async function addTripMember(
    tripId: string | number,
    payload: TripMemberPayload,
): Promise<TripMemberResponse> {
    const res = await api.post<TripMemberResponse>(`/trips/${tripId}/members`, payload);
    return res.data;
}

export async function removeTripMember(
    tripId: string | number,
    memberId: string | number,
): Promise<void> {
    await api.delete(`/trips/${tripId}/members/${memberId}`);
}