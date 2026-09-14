import axios from 'axios';
import { NativeModules, Platform } from 'react-native';
import { api } from '../api/client';
import { fetchMyProfile, updateNotificationSetting } from '../api/mypage';
import { fetchIntegrationCapabilities } from '../api/integrations';

type Status = { granted: boolean; enabled: boolean; owner: string; packages: string[] };
export type CaptureSource = { packageName: string; label: string };
type Captured = { ownerUserId: string; eventId: string; sourcePackage: string; amount: number; observedAt: number };
interface CaptureNative {
  bind(owner: string): Promise<void>;
  status(): Promise<Status>;
  openSettings(): Promise<void>;
  configure(owner: string, enabled: boolean, packages: string[]): Promise<void>;
  read(owner: string): Promise<string>;
  ack(owner: string, eventId: string): Promise<void>;
  clear(): Promise<void>;
  sources(): Promise<CaptureSource[]>;
}
export const captureNative = (): CaptureNative => {
  const module = NativeModules.PaymentCapture as CaptureNative | undefined;
  if (Platform.OS !== 'android' || !module) throw new Error('Android 개발 빌드가 필요합니다.');
  return module;
};
export const isCaptureAvailable = () => Platform.OS === 'android' && !!NativeModules.PaymentCapture;
let captureEpoch = 0;
export async function clearCapture() {
  ++captureEpoch;
  if (NativeModules.PaymentCapture) await captureNative().clear();
}
export async function captureStatus() {
  const epoch = captureEpoch;
  const profile = await fetchMyProfile();
  const n = captureNative();
  if (epoch !== captureEpoch) throw new Error("로그인 상태가 변경되었습니다.");
  await n.bind(String(profile.id));
  const state = await n.status();
  if (epoch !== captureEpoch) throw new Error("로그인 상태가 변경되었습니다.");
  if (!profile.paySync && state.enabled) await n.configure(String(profile.id), false, []);
  return { ...state, enabled: state.enabled && profile.paySync, owner: String(profile.id) };
}
export async function enableCapture(packages: string[]) {
  const epoch = captureEpoch;
  if (!(await fetchIntegrationCapabilities()).paySync) throw new Error('서버 결제 수집 기능이 아직 설정되지 않았어요.');
  const profile = await fetchMyProfile();
  const n = captureNative();
  if (epoch !== captureEpoch) return false;
  await n.bind(String(profile.id));
  if (!(await n.status()).granted) { await n.openSettings(); return false; }
  // 화면에서 설명을 읽고 '동의하고 수집 켜기'를 누른 경우에만 실행한다.
  await updateNotificationSetting('paySync', true);
  if (epoch !== captureEpoch) return false;
  await n.configure(String(profile.id), true, packages);
  return true;
}
export async function disableCapture() {
  const profile = await fetchMyProfile();
  await captureNative().configure(String(profile.id), false, []); // 네이티브 수집부터 중지
  await updateNotificationSetting('paySync', false);
}
let uploading = false;
export async function syncCapturedPayments() {
  if (uploading || !NativeModules.PaymentCapture) return;
  uploading = true;
  try {
    if (!(await fetchIntegrationCapabilities()).paySync) return;
    const state = await captureStatus();
    if (!state.enabled || !state.granted) return;
    const n = captureNative();
    const items: Captured[] = JSON.parse(await n.read(state.owner));
    for (const item of items) {
      const current = await n.status();
      if (!current.enabled || !current.granted || current.owner !== state.owner) break;
      if (item.ownerUserId !== state.owner) continue;
      try { await api.post('/api/payment-candidates', item); }
      catch (error) {
        // Expired or malformed candidate metadata is terminal; do not block the rest of the queue.
        if (!axios.isAxiosError(error) || error.response?.status !== 400) throw error;
      }
      await n.ack(state.owner, item.eventId); // 서버 성공 이후에만 로컬 제거
    }
  } finally { uploading = false; }
}