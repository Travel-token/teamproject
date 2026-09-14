import * as Location from 'expo-location';

/**
 *
 * 주의: 이 함수는 위치 권한을 요청하지 않는다. 권한 요청은 마이페이지의 GPS 토글에서만
 * 하도록 의도적으로 몰아뒀고(devicePermissions.ts), 여기서는 이미 허용된 상태라고 가정하고
 * 좌표만 읽는다. 호출하는 쪽에서 getLocationPermissionStatus()로 granted 여부를 먼저 확인해야 한다.
 */
export async function fetchCurrentRegionLabel(): Promise<string | null> {
    try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== 'granted') return null;
        const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
        });

        const results = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });
        const place = results[0];
        if (!place) return null;

        // 추천 후보의 행정구역 형식과 같게 "시·도 + 시·군·구"까지만 만든다.
        // 동·읍·면 및 도로명은 포함하지 않는다.
        const first = place.region || place.city || null;
        const city = place.city && place.city !== first ? place.city : null;
        const district = place.district && /(?:시|군|구)$/.test(place.district) ? place.district : null;
        const second = place.subregion || city || district;
        return [first, second].filter((value, index, all): value is string => !!value && all.indexOf(value) === index).join(' ') || null;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // eslint-disable-next-line no-console
        console.error('[currentRegion] 행정구역 조회 실패:', message);
        return null;
    }
}
