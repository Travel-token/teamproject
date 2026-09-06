import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../theme/ThemeContext';
import { PlaceItem } from '../types';
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from '../config/mapStyle';

interface Props {
    spots: PlaceItem[];
    height?: number;
}

export default function RouteMapView({ spots, height = 260 }: Props) {
    const { colors, isDark } = useTheme();
    const mapRef = useRef<MapView>(null);

    const routable = spots.filter(
        (s): s is PlaceItem & { lat: number; lng: number } => s.lat != null && s.lng != null
    );

    // id:lat,lng를 순서대로 이어붙인 키. 순서가 바뀌거나 좌표가 바뀔 때만 값이 달라져서
    // 아래 이펙트가 "정말 필요할 때만" 카메라를 다시 맞추도록 하는 용도.
    const coordKey = routable.map((s) => `${s.id}:${s.lat},${s.lng}`).join('|');

    const lineCoords = useMemo(
        () => routable.map((s) => ({ latitude: s.lat, longitude: s.lng })),
        [coordKey]
    );

    const [mapReady, setMapReady] = useState(false);

    // 지도 레이아웃 완료 전 fitToCoordinates 호출 시 "Map size can't be 0" 에러 발생.
    // onMapReady 이후에만 카메라를 맞춘다.
    const fitCamera = useCallback(() => {
        if (routable.length === 0 || !mapRef.current) return;

        if (routable.length === 1) {
            mapRef.current.animateToRegion(
                {
                    latitude: routable[0].lat,
                    longitude: routable[0].lng,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                },
                400
            );
            return;
        }

        mapRef.current.fitToCoordinates(lineCoords, {
            edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
            animated: true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coordKey, lineCoords]);

    useEffect(() => {
        if (!mapReady) return;
        fitCamera();
    }, [mapReady, coordKey, fitCamera]);

    if (routable.length === 0) {
        return (
            <View
                style={[
                    styles.wrap,
                    styles.emptyWrap,
                    { height, backgroundColor: colors.bgCard2, borderColor: colors.bdCard },
                ]}
            >
                <Text style={{ fontSize: 22 }}>🗺️</Text>
                <Text style={{ fontSize: 12, color: colors.txMuted, marginTop: 6 }}>표시할 위치 정보가 없어요</Text>
            </View>
        );
    }

    return (
        <View style={[styles.wrap, { height, borderColor: colors.bdCard }]}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                // Android는 Google Maps + 커스텀 다크/라이트 JSON 스타일 적용.
                // iOS는 기본 Apple Maps를 쓰고 userInterfaceStyle로 다크/라이트만 맞춤
                // (Apple Maps는 Google 스타일 JSON을 지원하지 않아서 별도 iOS Google Maps 키 설정 없이 이 방식이 제일 안정적).
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                customMapStyle={[]}
                userInterfaceStyle={isDark ? 'dark' : 'light'}
                initialRegion={{
                    latitude: routable[0].lat,
                    longitude: routable[0].lng,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                scrollEnabled
                zoomEnabled
                rotateEnabled={false}
                pitchEnabled={false}
                showsCompass={false}
                showsScale={false}
                toolbarEnabled={false}
                showsMyLocationButton={false}
                onMapReady={() => setMapReady(true)}
            >
                {lineCoords.length > 1 && (
                    <Polyline
                        coordinates={lineCoords}
                        strokeColor={colors.bgChipActive}
                        strokeWidth={4}
                        lineCap="round"
                        geodesic
                    />
                )}

                {routable.map((s, i) => {
                    const isEndpoint = i === 0 || i === routable.length - 1;
                    return (
                        <Marker
                            key={s.id}
                            coordinate={{ latitude: s.lat, longitude: s.lng }}
                            anchor={{ x: 0.5, y: 0.5 }}
                            tracksViewChanges={false}
                        >
                            <View
                                style={[
                                    styles.markerBadge,
                                    {
                                        backgroundColor: colors.bgChipActive,
                                        borderColor: isEndpoint ? colors.txPrimary : colors.bgCard,
                                    },
                                ]}
                            >
                                <Text style={styles.markerText}>{i + 1}</Text>
                            </View>
                        </Marker>
                    );
                })}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 0.5,
    },
    emptyWrap: { alignItems: 'center', justifyContent: 'center' },
    markerBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    markerText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
});