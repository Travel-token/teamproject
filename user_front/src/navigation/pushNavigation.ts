import { openNotificationInbox } from '../services/notificationInbox';
import { getSession } from '../services/authSession';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { fetchMyProfile } from '../api/mypage';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
let pending: Notifications.NotificationResponse | null = null;
let opening = false;
export function queuePush(response: Notifications.NotificationResponse | null) {
  if (response) { pending = response; void flushPendingPush().catch(() => undefined); }
}
export function clearPendingPush() { pending = null; }
export async function flushPendingPush() {
  if (opening || !pending || !navigationRef.isReady() || navigationRef.getCurrentRoute()?.name === 'Login') return;
  if (!(await getSession())) return;
  opening = true;
  try {
    const response = pending;
    const data = response.notification.request.content.data;
    const p = await fetchMyProfile();
    // 프로필 조회 중 로그아웃/다른 알림 도착이 있었으면 처리하지 않는다.
    if (pending !== response || navigationRef.getCurrentRoute()?.name === 'Login') return;
    if (String(p.id) !== String(data.userId)) { pending = null; return; }
    const key = response.notification.request.identifier;
    if (key === await AsyncStorage.getItem('lastOpenedPush')) { pending = null; return; }
    pending = null;
    await AsyncStorage.setItem('lastOpenedPush', key);
    if (data.type === 'settle' && /^\d+$/.test(String(data.tripId))) {
      navigationRef.navigate('RoomSettle', { tripId: String(data.tripId) });
    }
    else if (data.type === 'gps' && /^\d+$/.test(String(data.tripId))) {
      navigationRef.navigate('RoomMap', { tripId: String(data.tripId) });
    } else { navigationRef.navigate('Tabs'); openNotificationInbox(); }
  } finally { opening = false; }
}
