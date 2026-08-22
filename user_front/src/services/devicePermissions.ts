import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

/**
 * 기기(OS) 권한 상태를 조회/요청하는 모듈.
 *
 * user_settings 테이블의 notifGps / notifSettle / notifInvite / notifMarketing 은
 * "앱 설정값"일 뿐이고, 실제로 위치를 읽거나 푸시를 보낼 수 있는지는
 * OS 권한(위치 권한 / 알림 권한)에 달려 있다.
 * 이 모듈은 그 OS 권한 쪽을 다루고, 서버 값과 맞추는 건 호출하는 쪽(화면)의 책임이다.
 *
 * canAskAgain 관련 핵심 규칙:
 * - OS는 거부 이력에 따라 request*PermissionsAsync가 네이티브 팝업을 다시 띄울지(canAskAgain: true)
 *   아니면 팝업 없이 그냥 denied만 반환할지(canAskAgain: false)를 스스로 결정한다.
 * - canAskAgain이 true일 땐 다시 누르면 OS가 알아서 팝업을 다시 보여주므로, 우리가 "설정으로 이동" 같은
 *   안내를 할 필요가 없다 — 그냥 다시 요청하면 된다.
 * - canAskAgain이 false일 때만 (Android: 2번째 거부 or "다시 묻지 않음", iOS: 1회 거부 이후 항상)
 *   더 이상 팝업이 뜨지 않으므로, 이때만 기기 설정 화면으로 안내해야 한다.
 *
 * 중요: 일부 기기(특히 Android, "다시 묻지 않음" 선택 이후 재요청)는 팝업을 다시 띄우는 대신
 * request*PermissionsAsync 호출 자체가 reject 되기도 한다. 이걸 그대로 두면 호출부의
 * await가 예외를 던지고 함수가 조용히 죽어서, 화면에서는 "눌러도 아무 반응 없음"처럼 보이고
 * 콘솔에도 아무 로그가 안 남는다. 그래서 여기서는 절대 throw하지 않고, 실패도 항상
 * { status: 'denied', error } 형태로 값으로 반환해서 호출부가 항상 처리할 수 있게 한다.
 */

export type DevicePermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionResult {
    status: DevicePermissionStatus;
    /** false면 OS가 더 이상 네이티브 팝업을 띄우지 않는다는 뜻 — 이때만 설정 화면으로 안내한다. */
    canAskAgain: boolean;
    /** OS 호출 자체가 실패했을 때만 채워짐 (단순 거부와는 구분되는, 디버깅용 원인) */
    error?: string;
}

function logPermissionError(tag: string, err: unknown): string {
    const message = err instanceof Error ? err.message : String(err);
    // 디바이스에 Metro가 붙어있으면 여기서 바로 확인 가능.
    // eslint-disable-next-line no-console
    console.error(`[devicePermissions] ${tag} 실패:`, message);
    return message;
}

// ── 위치 권한 (GPS 장소 추천) ──────────────────────────────

export async function getLocationPermissionStatus(): Promise<PermissionResult> {
    try {
        const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
        return { status: status as DevicePermissionStatus, canAskAgain };
    } catch (err) {
        // 상태 조회 자체가 실패한 경우엔 다시 시도해볼 수 있다고 가정 (무조건 설정으로 보내지 않음)
        return { status: 'denied', canAskAgain: true, error: logPermissionError('위치 권한 조회', err) };
    }
}

/**
 * 위치 권한 요청. 이미 허용된 상태면 OS 팝업 없이 바로 granted를 반환하고,
 * 아니라면 매번 OS에 다시 물어본다 — canAskAgain이 true인 동안은 누를 때마다 네이티브 팝업이 뜬다.
 */
export async function requestLocationPermission(): Promise<PermissionResult> {
    try {
        const current = await Location.getForegroundPermissionsAsync();
        if (current.status === 'granted') return { status: 'granted', canAskAgain: current.canAskAgain };

        const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
        return { status: status as DevicePermissionStatus, canAskAgain };
    } catch (err) {
        return { status: 'denied', canAskAgain: true, error: logPermissionError('위치 권한 요청', err) };
    }
}

// ── 알림 권한 (정산 / 초대 / 마케팅 알림) ──────────────────────────────
// iOS/Android 모두 알림 권한은 "앱 단위"로 한 번만 허용되고, 카테고리별로는
// 나뉘지 않는다. 따라서 notifSettle / notifInvite / notifMarketing 세 토글은
// 모두 이 하나의 OS 알림 권한을 공유한다.

export async function getNotificationPermissionStatus(): Promise<PermissionResult> {
    try {
        const { status, canAskAgain } = await Notifications.getPermissionsAsync();
        return { status: status as DevicePermissionStatus, canAskAgain };
    } catch (err) {
        return { status: 'denied', canAskAgain: true, error: logPermissionError('알림 권한 조회', err) };
    }
}

export async function requestNotificationPermission(): Promise<PermissionResult> {
    try {
        const current = await Notifications.getPermissionsAsync();
        if (current.status === 'granted') return { status: 'granted', canAskAgain: current.canAskAgain };

        const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
        return { status: status as DevicePermissionStatus, canAskAgain };
    } catch (err) {
        return { status: 'denied', canAskAgain: true, error: logPermissionError('알림 권한 요청', err) };
    }
}

// ── 공용 ──────────────────────────────

/** OS가 더 이상 팝업을 띄우지 않는 상태(canAskAgain === false)일 때만 여기로 보낸다. */
export function openDeviceSettings(): void {
    Linking.openSettings();
}