import React from 'react';
import { Text, View } from 'react-native';
import { PlaceItem } from '../types';
import { useTheme } from '../theme/ThemeContext';

// The native map package cannot be imported by Metro's web bundle.
// This is a coordinate overview, not a road-routing or navigation map.
export default function RouteMapView({ spots, height = 260 }: { spots: PlaceItem[]; height?: number }) {
    const { colors } = useTheme();
    const places = spots.filter(p => p.lat != null && p.lng != null && Number.isFinite(p.lat) && Number.isFinite(p.lng));
    if (!places.length) return <View style={{ height, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCard2 }}><Text style={{ color: colors.txMuted }}>표시할 위치 정보가 없어요</Text></View>;
    const minLat = Math.min(...places.map(p => p.lat));
    const maxLat = Math.max(...places.map(p => p.lat));
    const minLng = Math.min(...places.map(p => p.lng));
    const maxLng = Math.max(...places.map(p => p.lng));
    const points = places.map(p => ({
        x: maxLng === minLng ? 200 : 30 + (p.lng - minLng) / (maxLng - minLng) * 340,
        y: maxLat === minLat ? 100 : 175 - (p.lat - minLat) / (maxLat - minLat) * 150,
    }));
    return <View style={{ height, backgroundColor: colors.bgCard2, padding: 12, borderRadius: 12 }}>
        <Text style={{ color: colors.txSecondary, marginBottom: 8 }}>동선 좌표 미리보기 · 번호는 방문 순서예요</Text>
        <svg viewBox="0 0 400 200" style={{ width: '100%', flex: 1 }} role="img" aria-label="방문한 장소의 좌표와 순서">
            <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={colors.txMuted} strokeWidth="2" />
            {places.map((p, i) => <g key={p.id}>
                <title>{`${i + 1}. ${p.name} (${p.lat}, ${p.lng})`}</title>
                <circle cx={points[i].x} cy={points[i].y} r="13" fill={colors.txPrimary} />
                <text x={points[i].x} y={points[i].y + 4} textAnchor="middle" fontSize="12" fill={colors.bgCard2}>{i + 1}</text>
            </g>)}
        </svg>
    </View>;
}
