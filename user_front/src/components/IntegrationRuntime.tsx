import { flushRevocations } from '../services/authSession';
import React, { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { integrationTick } from '../services/integrationLifecycle';
import { queuePush } from '../navigation/pushNavigation';

export default function IntegrationRuntime() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sync = (refresh = false) => {
      if (AppState.currentState === 'active') {
        void flushRevocations().catch(() => undefined);
        void integrationTick(false, refresh).catch(() => {
          // 원문/토큰은 로그에 남기지 않는다. MyPage의 수동 동기화로 오류를 확인할 수 있다.
          console.warn('알림 연동 동기화 실패. 다음 활성 주기에 재시도합니다.');
        });
      }
    };
    sync();
    const app = AppState.addEventListener('change', s => { if (s === 'active') sync(); });
    const token = Notifications.addPushTokenListener(() => sync(true));
    const response = Notifications.addNotificationResponseReceivedListener(queuePush);
    void Notifications.getLastNotificationResponseAsync().then(queuePush).catch(() => undefined);
    const timer = setInterval(() => sync(), 30000);
    return () => { app.remove(); token.remove(); response.remove(); clearInterval(timer); };
  }, []);
  return null;
}
