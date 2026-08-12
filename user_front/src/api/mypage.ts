import { api } from './client';
import { removeToken } from '../services/tokenService';
import { HistoryTrip } from '../types';

// ── 프로필 ──────────────────────────────
export interface ProfileResponse {
  name: string;
  handle: string;
  bank: string;
  accountNumber: string;
  notifSettle: boolean;
  notifInvite: boolean;
  notifGps: boolean;
  notifMarketing: boolean;
  paySync: boolean;
  darkMode: boolean;
}

// 서버가 { success, data } 로 감싸지 않고 이 엔드포인트들은 객체를 그대로 내려준다.
export async function fetchMyProfile(): Promise<ProfileResponse> {
  const res = await api.get<ProfileResponse>('/users/me');
  return res.data;
}

export async function updateMyProfileName(name: string): Promise<void> {
  await api.patch('/users/me', { name });
}

export async function updateAccount(bank: string, accountNumber: string): Promise<void> {
  await api.patch('/users/me/account', { bank, accountNumber });
}

export type NotificationKey =
  | 'notifSettle'
  | 'notifInvite'
  | 'notifGps'
  | 'notifMarketing'
  | 'paySync'
  | 'darkMode';

export async function updateNotificationSetting(key: NotificationKey, value: boolean): Promise<void> {
  await api.patch('/users/me/notifications', { [key]: value });
}

// ── 내 피드 ──────────────────────────────
// 서버 응답(FeedDetailResponse)도 { success, data } 로 감싸지 않고 그대로 내려온다.
interface FeedDetailApi {
  id: number;
  placeId: number;
  caption: string;
  distanceKm: number | null;
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  createdAt: string;
  photoUrls: string[];
}

export interface MyFeedItem {
  id: string;
  placeId: number;
  caption: string;
  distanceKm: number | null;
  likes: number;
  views: number;
  comments: number;
  photoUrls: string[];
  createdAt: string;
}

function toMyFeedItem(f: FeedDetailApi): MyFeedItem {
  return {
    id: String(f.id),
    placeId: f.placeId,
    caption: f.caption,
    distanceKm: f.distanceKm,
    likes: f.likesCount,
    views: f.viewsCount,
    comments: f.commentsCount,
    photoUrls: f.photoUrls ?? [],
    createdAt: f.createdAt,
  };
}

export async function fetchMyFeeds(): Promise<MyFeedItem[]> {
  const res = await api.get<FeedDetailApi[]>('/users/me/feeds');
  return res.data.map(toMyFeedItem);
}

// 생성 시엔 FeedCreateRequest(placeId, caption, photoUrls)와 동일
export interface MyFeedCreatePayload {
  placeId: number;
  caption: string;
  photoUrls?: string[];
}

// 수정 시엔 FeedUpdateRequest(caption, photoUrls)와 동일 — 장소는 바꿀 수 없다
export interface MyFeedUpdatePayload {
  caption: string;
  photoUrls?: string[];
}

export async function createMyFeed(payload: MyFeedCreatePayload): Promise<MyFeedItem> {
  const res = await api.post<FeedDetailApi>('/users/me/feeds', payload);
  return toMyFeedItem(res.data);
}

export async function updateMyFeed(id: string, payload: MyFeedUpdatePayload): Promise<MyFeedItem> {
  const res = await api.put<FeedDetailApi>(`/users/me/feeds/${id}`, payload);
  return toMyFeedItem(res.data);
}

export async function deleteMyFeed(id: string): Promise<void> {
  await api.delete(`/users/me/feeds/${id}`);
}

// ── 여행 기록 ──────────────────────────────
// 서버 응답(TripHistoryResponse[] / ExpenseStatsResponse)도 { success, data } 로 감싸지 않고 그대로 내려온다.
interface TripHistoryApi {
  tripId: number;
  name: string;
  region: string | null;
  startDate: string | null; // ISO date (YYYY-MM-DD)
  endDate: string | null;
  status: 'planned' | 'ongoing' | 'completed';
  totalExpenseAmount: number;
}

interface ExpenseStatsApi {
  totalAmount: number;
  categoryStats: { categoryCode: string; categoryLabel: string; amount: number }[];
}

export interface HistoryStats {
  tripCount: number;
  totalDays: number;
  placeCount: number;
  totalExpense: number; // 원 단위, 화면에서 "3.2만" 처럼 축약 표기하려면 프론트에서 가공
}

function tripDays(t: TripHistoryApi): number {
  if (!t.startDate || !t.endDate) return 0;
  const diff = Math.round(
    (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / (1000 * 60 * 60 * 24),
  ) + 1;
  return diff > 0 ? diff : 0;
}

function tripDateLabel(t: TripHistoryApi): string {
  const fmt = (iso: string) => {
    const [, m, d] = iso.split('-');
    return `${m}.${d}`;
  };
  if (!t.startDate) return '';
  return t.endDate && t.endDate !== t.startDate ? `${fmt(t.startDate)} - ${fmt(t.endDate)}` : fmt(t.startDate);
}

function tripBadge(status: TripHistoryApi['status']): '진행 중' | '완료' {
  return status === 'ongoing' ? '진행 중' : '완료';
}

// 서버엔 "여행 횟수/총 여행일수/방문 장소 수"를 한 번에 주는 통계 엔드포인트가 없어서
// /history(여행 목록)로 여행 횟수·일수를 계산하고, /history/stats(카테고리별 지출)의 총합을 총 지출액으로 쓴다.
// 방문 장소 수는 아직 이를 집계해주는 API가 없어 0으로 내려간다. (관련 API가 추가되면 교체)
export async function fetchHistoryStats(): Promise<HistoryStats> {
  const [tripsRes, statsRes] = await Promise.all([
    api.get<TripHistoryApi[]>('/users/me/history'),
    api.get<ExpenseStatsApi>('/users/me/history/stats'),
  ]);
  const trips = tripsRes.data ?? [];
  return {
    tripCount: trips.length,
    totalDays: trips.reduce((sum, t) => sum + tripDays(t), 0),
    placeCount: 0,
    totalExpense: Number(statsRes.data?.totalAmount ?? 0),
  };
}

export async function fetchHistoryTrips(query?: string): Promise<HistoryTrip[]> {
  const res = await api.get<TripHistoryApi[]>('/users/me/history');
  let trips = res.data ?? [];

  // 서버에 검색 파라미터가 없어서 이름 기준으로 프론트에서 필터링한다.
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    trips = trips.filter((t) => t.name.toLowerCase().includes(q));
  }

  // 서버에 "숨김" 개념이 없어서, 최근 5개는 바로 보여주고 나머지는 '전체 여행 더보기'로 접어둔다.
  return trips.map((t, i) => ({
    id: String(t.tripId),
    name: t.name,
    dateLabel: tripDateLabel(t),
    amount: Number(t.totalExpenseAmount ?? 0),
    badge: tripBadge(t.status),
    collage: [],
    hidden: i >= 5,
    days: tripDays(t),
  }));
}

// ── 계정 ──────────────────────────────
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    // 서버 호출 성공 여부와 무관하게 로컬 토큰은 항상 지운다.
    await removeToken();
  }
}

export async function withdrawAccount(): Promise<void> {
  await api.delete('/users/me');
}