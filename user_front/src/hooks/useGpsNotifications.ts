import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AppState, Platform } from 'react-native';
import * as Location from 'expo-location';
import { fetchMyProfile } from '../api/mypage';
import { emitGpsEvent } from '../api/notificationEvents';
import { getSession, isSameSession } from '../services/authSession';

/** Foreground RoomMap only. Permission is requested by the existing MyPage GPS toggle. */
export function useGpsNotifications(tripId: string) {
    useFocusEffect(useCallback(() => {
        if (Platform.OS !== 'android') return;
        let alive = true, busy = false, nextAt = 0;
        const tick = async () => {
            if (!alive || busy || AppState.currentState !== 'active' || Date.now() < nextAt) return;
            busy = true;
            try {
                const session = await getSession();
                if (!session || !(await fetchMyProfile()).notifGps) return;
                const permission = await Location.getForegroundPermissionsAsync();
                if (!permission.granted || !alive || AppState.currentState !== 'active') return;
                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
                if (!alive || AppState.currentState !== 'active' || !isSameSession(session.sessionId)) return;
                const areas = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
                const area = areas[0];
                // 시·도와 시·군·구까지만 조합한다. district(동/읍/면)는 보내지 않는다.
                const administrativeArea = [area?.region, area?.subregion || area?.city]
                    .filter((value, index, all): value is string => !!value && all.indexOf(value) === index)
                    .join(' ')
                    .trim();
                if (!administrativeArea) return;
                // Raw coordinates stay on the device; only an administrative-area label is sent.
                await emitGpsEvent(tripId, administrativeArea);
                nextAt = Date.now() + 5 * 60 * 1000;
            } catch { nextAt = Date.now() + 60000; }
            finally { busy = false; }
        };
        void tick();
        const timer = setInterval(() => { void tick(); }, 60000);
        const app = AppState.addEventListener('change', state => { if (state === 'active') void tick(); });
        return () => { alive = false; clearInterval(timer); app.remove(); };
    }, [tripId]));
}
