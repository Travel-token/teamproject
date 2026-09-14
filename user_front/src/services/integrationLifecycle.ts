import { getSession, isSameSession } from './authSession';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { fetchMyProfile } from '../api/mypage';
import { clearCapture, syncCapturedPayments } from './paymentCapture';
import { registerPush, unregisterPush } from './push';
import { fetchIntegrationCapabilities } from '../api/integrations';

let halted = false;
let chain: Promise<void> = Promise.resolve();
let lastPush = 0;
let busyTick: Promise<void> | null = null;
export function resumeIntegrations() { halted = false; lastPush = 0; }
export function integrationTick(askPermission = false, refreshPush = false): Promise<void> {
  if (stopping) return stopping.then(() => integrationTick(askPermission, refreshPush));
  if (!askPermission && !refreshPush && busyTick) return busyTick;
  const next = chain.catch(() => undefined).then(async () => {
    const session = await getSession();
    if (halted || !session) return;
    const p = await fetchMyProfile();
    const capabilities = await fetchIntegrationCapabilities();
    if (halted || !isSameSession(session.sessionId)) return;
    await AsyncStorage.setItem('integrationUserId', String(p.id));
    let pushError: unknown;
    if (askPermission && !capabilities.push) throw new Error('서버 푸시 기능이 아직 설정되지 않았어요.');
    if (capabilities.push && (askPermission || refreshPush || Date.now() - lastPush > 10 * 60 * 1000)) {
      try { await registerPush(String(p.id), askPermission); lastPush = Date.now(); }
      catch (e) { pushError = e; }
    }
    // 푸시 자격 증명 오류가 결제 수집 동기화까지 차단하지 않도록 따로 실행.
    if (!halted && isSameSession(session.sessionId) && capabilities.paySync) await syncCapturedPayments();
    if (pushError) throw pushError;
  });
  chain = next;
  busyTick = next;
  void next.finally(() => { if (busyTick === next) busyTick = null; }).catch(() => undefined);
  return next;
}
let stopping: Promise<void> | null = null;
export function stopIntegrations(): Promise<void> {
  if (stopping) return stopping;
  halted = true;
  const next = (async () => {
    await clearCapture();
    await chain.catch(() => undefined);
    // A request in flight may have touched the native store; clear it again after it drains.
    await clearCapture();
    await unregisterPush().catch(() => undefined);
    await AsyncStorage.removeItem('integrationUserId');
    if (Platform.OS === 'android') {
      await Notifications.dismissAllNotificationsAsync().catch(() => undefined);
      await Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
    }
  })();
  stopping = next;
  void next.finally(() => { if (stopping === next) stopping = null; }).catch(() => undefined);
  return next;
}