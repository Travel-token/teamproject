import * as Location from 'expo-location';

/**
 *
 * 주의: 이 함수는 위치 권한을 요청하지 않는다. 권한 요청은 마이페이지의 GPS 토글에서만
 * 하도록 의도적으로 몰아뒀고(devicePermissions.ts), 여기서는 이미 허용된 상태라고 가정하고
 * 좌표만 읽는다. 호출하는 쪽에서 getLocationPermissionStatus()로 granted 여부를 먼저 확인해야 한다.
 */
export async function fetchCurrentRegionLabel(): Promise<string | null> {
    try {
        const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const results = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });
        const place = results[0];
        if (!place) return null;

        // 한국 주소 기준: Android Geocoder가 subAdminArea(시/군/구)를 subregion으로 내려준다.
        // 그게 없는 드문 케이스에만 시/도 단위(city/region)로 대체한다.
        return place.subregion || place.city || place.region || null;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // eslint-disable-next-line no-console
        console.error('[currentRegion] 행정구역 조회 실패:', message);
        return null;
    }
}