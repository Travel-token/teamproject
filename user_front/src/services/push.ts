import { getSession, isSameSession } from './authSession';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '../api/client';

const TOKEN_KEY = 'expoPushToken';
// SDK 51 / expo-notifications 0.28의 NotificationBehavior.
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const session = await getSession();
    const allowed = !!session && String(session.userId) === String(notification.request.content.data.userId ?? '');
    return { shouldShowAlert: allowed, shouldPlaySound: allowed, shouldSetBadge: false };
  },
});

export async function registerPush(userId: string, askPermission = false) {
  if (Platform.OS !== 'android') {
    if (askPermission) throw new Error('Android 기기에서 푸시 알림을 연결해 주세요.');
    return;
  }
  const session = await getSession();
  if (!session || String(session.userId) !== userId) return;
  await Notifications.setNotificationChannelAsync('travel', {
    name: '여행 알림', importance: Notifications.AndroidImportance.HIGH,
  });
  let permission = await Notifications.getPermissionsAsync();
  if (askPermission && !permission.granted) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    await unregisterPush();
    if (askPermission) throw new Error('알림 표시 권한을 허용해 주세요. 거부가 고정되어 있으면 기기 설정에서 변경하세요.');
    return;
  }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error('EAS projectId가 없습니다.');
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  if (!isSameSession(session.sessionId)) return;
  const old = await AsyncStorage.getItem(TOKEN_KEY);
  if (old && old !== token) await api.delete('/api/push-devices', { data: { token: old } });
  // 네트워크 성공 응답 유실 시에도 로그아웃에서 해제할 토큰을 알고 있도록 먼저 저장한다.
  await AsyncStorage.setItem(TOKEN_KEY, token);
  if (!isSameSession(session.sessionId)) return;
  await api.put('/api/push-devices', { ownerUserId: userId, token });
}

export async function unregisterPush() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) await api.delete('/api/push-devices', { data: { token } });
  await AsyncStorage.removeItem(TOKEN_KEY);
}
