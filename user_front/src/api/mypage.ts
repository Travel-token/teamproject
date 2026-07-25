import { api, ApiResponse } from './client';
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
}

export async function fetchMyProfile(): Promise<ProfileResponse> {
  const res = await api.get<ApiResponse<ProfileResponse>>('/users/me');
  return res.data.data;
}

export async function updateMyProfileName(name: string): Promise<void> {
  await api.patch('/users/me', { name });
}

export async function updateAccount(bank: string, accountNumber: string): Promise<void> {
  await api.patch('/users/me/account', { bank, accountNumber });
}

export type NotificationKey = 'notifSettle' | 'notifInvite' | 'notifGps' | 'notifMarketing' | 'paySync';

export async function updateNotificationSetting(key: NotificationKey, value: boolean): Promise<void> {
  await api.patch('/users/me/notifications', { [key]: value });
}

// ── 내 피드 ──────────────────────────────
export interface MyFeedItem {
  id: string;
  emoji: string;
  place: string;
  caption: string;
  likes: number;
  views: number;
}

export async function fetchMyFeeds(): Promise<MyFeedItem[]> {
  const res = await api.get<ApiResponse<MyFeedItem[]>>('/users/me/feeds');
  return res.data.data;
}

export interface MyFeedPayload {
  emoji: string;
  place: string;
  caption: string;
}

export async function createMyFeed(payload: MyFeedPayload): Promise<MyFeedItem> {
  const res = await api.post<ApiResponse<MyFeedItem>>('/users/me/feeds', payload);
  return res.data.data;
}

export async function updateMyFeed(id: string, payload: MyFeedPayload): Promise<MyFeedItem> {
  const res = await api.put<ApiResponse<MyFeedItem>>(`/users/me/feeds/${id}`, payload);
  return res.data.data;
}

export async function deleteMyFeed(id: string): Promise<void> {
  await api.delete(`/users/me/feeds/${id}`);
}

// ── 여행 기록 ──────────────────────────────
export interface HistoryStats {
  tripCount: number;
  totalDays: number;
  placeCount: number;
  totalExpense: number; // 원 단위, 화면에서 "3.2만" 처럼 축약 표기하려면 프론트에서 가공
}

export async function fetchHistoryStats(): Promise<HistoryStats> {
  const res = await api.get<ApiResponse<HistoryStats>>('/users/me/history/stats');
  return res.data.data;
}

export async function fetchHistoryTrips(query?: string): Promise<HistoryTrip[]> {
  const res = await api.get<ApiResponse<HistoryTrip[]>>('/users/me/history', {
    params: query ? { q: query } : undefined,
  });
  return res.data.data;
}

// ── 계정 ──────────────────────────────
export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function withdrawAccount(): Promise<void> {
  await api.delete('/users/me');
}