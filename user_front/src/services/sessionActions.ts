import { withdrawAccount } from '../api/mypage';
import { logoutSession } from './authSession';
import { stopIntegrations } from './integrationLifecycle';
import { clearPendingPush } from '../navigation/pushNavigation';
import { Alert } from 'react-native';
export async function endSession(withdraw = false) {
  // Withdrawal requires a successful server response; a temporary network failure keeps the account signed in.
  if (withdraw) await withdrawAccount();
  await stopIntegrations();
  clearPendingPush();
  const revoked = await logoutSession();
  if (!revoked && !withdraw) Alert.alert('기기 로그아웃 완료', '서버 연결이 되면 이 로그인 세션도 자동 해제됩니다. 연결 전에는 서버 세션과 일부 알림이 남을 수 있어요.');
}