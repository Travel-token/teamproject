import { api } from './client';
import { Trip, Member } from '../types';

/**
 * ============================================================
 * trip.ts : 여행(Trip) 서버 통신 담당 
 * ------------------------------------------------------------
 * [역할]
 *  - 백엔드의 여행 관련 창구(API)로 요청을 보내고 답장을 받는다.
 *  - 서버 말투(snake/tripId)를 화면 말투(Trip 타입)로 번역해서 돌려준다.
 *
 * [주의 - 팀원 코드(expense.ts)와 다른 점]
 *  expense.ts는 res.data.data (ApiResponse 래퍼)를 쓰지만,
 *  여행 API 백엔드는 DTO를 그대로 내려주므로 res.data 를 쓴다.
 *  → 나중에 백엔드를 래퍼 형식으로 통일하면 이 파일만 고치면 된다.
 *
 * [토큰]
 *  client.ts의 인터셉터가 AsyncStorage의 accessToken을 자동으로 헤더에 붙여준다.
 *  → 이 파일에서는 토큰을 신경 쓰지 않아도 된다.
 * ============================================================
 */

/** 서버가 내려주는 여행 1건의 모양 (Trip_ResponseDto와 1:1) */
export interface ServerTrip {
  tripId: number;
  name: string;
  region: string | null;
  startDate: string | null;   // "2026-04-10"
  endDate: string | null;
  budget: number | null;
  inviteCode: string;
  status: 'planned' | 'ongoing' | 'completed';
  createdBy: number;
  createdAt: string;
}

/** 서버가 내려주는 멤버 1건 (TripMember_ResponseDto와 1:1) */
export interface ServerMember {
  memberId: number;
  tripId: number;
  userId: number | null;
  displayName: string;
  shortName: string;
  colorCode: string;
  role: 'owner' | 'member';
}

/** 여행 생성/수정 시 보낼 내용 */
export interface TripPayload {
  name: string;
  region: string;
  startDate: string;   // "yyyy-MM-dd" (필수)
  endDate: string;     // "yyyy-MM-dd" (필수)
  budget?: number | null;
  creatorName?: string;
}

// ============================================================
// 번역기들 : 서버 모양 → 화면(Trip 타입) 모양
// ============================================================

/** "2026-04-10" + "2026-04-12" → "04.10 - 04.12" */
function toDateLabel(start: string | null, end: string | null): string {
  if (!start || !end) return '날짜 미정';
  const fmt = (d: string) => d.slice(5).replace('-', '.');  // "2026-04-10" → "04.10"
  return `${fmt(start)} - ${fmt(end)}`;
}

/** 며칠 여행인지 계산 (시작일과 종료일 포함해서 셈) */
function toDays(start: string | null, end: string | null): number {
  if (!start || !end) return 1;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * 서버 여행 → 화면용 Trip 객체.
 * 서버에 아직 없는 값(이모지·지출액·사진)은 기본값으로 채운다.
 * → 채우지 않으면 화면에 undefined가 그대로 새어나간다.
 */
export function toTrip(s: ServerTrip, members: Member[] = []): Trip {
  return {
    id: String(s.tripId),
    name: s.name,
    region: s.region ?? '미정',
    emoji: '🧳',                                    // trips 테이블에 emoji 컬럼이 없어 기본값
    status: s.status === 'completed' ? '완료' : '진행 중',
    dateLabel: toDateLabel(s.startDate, s.endDate),
    days: toDays(s.startDate, s.endDate),
    myExpense: 0,                                   // 지출 API 연동 후 채울 값
    totalExpense: 0,                                // 〃
    members,
    collage: [],
  };
}

/** 서버 멤버 → 화면용 Member */
export function toMember(m: ServerMember): Member {
  return { id: String(m.memberId), name: m.displayName };
}

// ============================================================
// API 호출 함수들
// ============================================================

/** GET /trips - 여행 목록 (status로 거를 수 있음) */
export async function fetchTrips(status?: 'planned' | 'ongoing' | 'completed'): Promise<Trip[]> {
  const res = await api.get<ServerTrip[]>('/trips', { params: status ? { status } : undefined });
  if (!Array.isArray(res.data)) return [];
  return res.data.map((s) => toTrip(s));
}

/** GET /trips/active - 진행 중인 여행 1건 (없으면 서버가 204를 주므로 null) */
export async function fetchActiveTrip(): Promise<Trip | null> {
  const res = await api.get<ServerTrip>('/trips/active');
  if (!res.data || !(res.data as ServerTrip).tripId) return null;
  return toTrip(res.data);
}

/** GET /trips/{id} - 여행 1건 */
export async function fetchTrip(tripId: string): Promise<Trip> {
  const res = await api.get<ServerTrip>(`/trips/${tripId}`);
  return toTrip(res.data);
}

/** POST /trips - 여행 만들기 (서버가 초대코드 자동 발급 + 방장 멤버 자동 등록) */
export async function createTrip(payload: TripPayload): Promise<Trip> {
  const res = await api.post<ServerTrip>('/trips', payload);
  return toTrip(res.data);
}

/** PATCH /trips/{id} - 여행 정보 수정 */
export async function updateTrip(tripId: string, payload: TripPayload): Promise<Trip> {
  const res = await api.patch<ServerTrip>(`/trips/${tripId}`, payload);
  return toTrip(res.data);
}

/** DELETE /trips/{id} - 여행 삭제 (동선·지출·멤버도 DB에서 함께 삭제됨) */
export async function deleteTrip(tripId: string): Promise<void> {
  await api.delete(`/trips/${tripId}`);
}

/** POST /trips/{id}/complete - 여행 종료 (상태를 completed로) */
export async function completeTrip(tripId: string): Promise<Trip> {
  const res = await api.post<ServerTrip>(`/trips/${tripId}/complete`);
  return toTrip(res.data);
}

/** GET /trips/{id}/invite-code - 초대 코드 조회 */
export async function fetchInviteCode(tripId: string): Promise<string> {
  const res = await api.get<{ inviteCode: string }>(`/trips/${tripId}/invite-code`);
  return res.data.inviteCode;
}

// ── 멤버 ──────────────────────────────

/** GET /trips/{id}/members - 멤버 목록 */
export async function fetchMembers(tripId: string): Promise<Member[]> {
  const res = await api.get<ServerMember[]>(`/trips/${tripId}/members`);
  if (!Array.isArray(res.data)) return [];
  return res.data.map(toMember);
}

/** POST /trips/{id}/members - 멤버 추가 (가입 안 한 친구도 이름만으로 가능) */
export async function addMember(tripId: string, displayName: string, colorCode?: string): Promise<Member> {
  const res = await api.post<ServerMember>(`/trips/${tripId}/members`, { displayName, colorCode });
  return toMember(res.data);
}

/** DELETE /trips/{id}/members/{memberId} - 멤버 내보내기 */
export async function removeMember(tripId: string, memberId: string): Promise<void> {
  await api.delete(`/trips/${tripId}/members/${memberId}`);
}

// ── 동선(장소 기록) ──────────────────────────────

/** 서버가 내려주는 동선 1건 (PlaceLog_ResponseDto와 1:1) */
export interface ServerPlaceLog {
  logId: number;
  tripId: number;
  placeId: number | null;
  name: string;
  memo: string | null;
  linkedExpenseId: number | null;
  visitedAt: string;          // "2026-04-10 14:50:00"
  detectedByGps: boolean;
}

/** GET /trips/{tripId}/places - 동선 목록 (방문 시각 순) */
export async function fetchPlaceLogs(tripId: string): Promise<ServerPlaceLog[]> {
  const res = await api.get<ServerPlaceLog[]>(`/trips/${tripId}/places`);
  return Array.isArray(res.data) ? res.data : [];
}

/** POST /trips/{tripId}/places - 동선 추가 */
export async function addPlaceLog(
  tripId: string,
  payload: { name: string; memo?: string; visitedAt?: string; placeId?: number }
): Promise<ServerPlaceLog> {
  const res = await api.post<ServerPlaceLog>(`/trips/${tripId}/places`, payload);
  return res.data;
}

/** DELETE /trips/{tripId}/places/{logId} - 동선 삭제 */
export async function deletePlaceLog(tripId: string, logId: string): Promise<void> {
  await api.delete(`/trips/${tripId}/places/${logId}`);
}