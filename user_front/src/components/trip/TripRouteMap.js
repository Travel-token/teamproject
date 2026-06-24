import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

const ROUTE_POINTS = [
  { x: 90, y: 92, label: '불국사', order: 1 },
  { x: 140, y: 68, label: '교동쌈밥', order: 2 },
  { x: 202, y: 68, label: '황리단길', order: 3 },
];

export default function TripRouteMap() {
  return (
    <View>
      <View style={styles.mapBox}>
        <Svg viewBox="0 0 336 220" width="100%" height={220}>
          <Rect width="336" height="220" fill="#E8F0E0" />
          <Rect x="50" y="90" width="90" height="4" rx="2" fill="#C8D8B0" />
          <Rect x="130" y="65" width="4" height="90" rx="2" fill="#C8D8B0" />
          <Rect x="160" y="110" width="110" height="4" rx="2" fill="#C8D8B0" />
          <Rect x="200" y="65" width="4" height="90" rx="2" fill="#C8D8B0" />
          <Polyline
            points="90,92 140,92 140,68 202,68 202,112 225,112"
            fill="none"
            stroke="#7F77DD"
            strokeWidth={2.5}
            strokeDasharray="6,3"
            opacity={0.85}
          />
          {ROUTE_POINTS.map((p) => (
            <React.Fragment key={p.label}>
              <Circle cx={p.x} cy={p.y} r={9} fill="#7F77DD" />
              <SvgText x={p.x} y={p.y + 4} textAnchor="middle" fontSize={10} fill="white" fontWeight="700">
                {p.order}
              </SvgText>
              <SvgText x={p.x} y={p.y - 12} textAnchor="middle" fontSize={9} fill="#534AB7" fontWeight="600">
                {p.label}
              </SvgText>
            </React.Fragment>
          ))}
          <Circle cx={225} cy={112} r={9} fill="#1D9E75" />
          <SvgText x={225} y={116} textAnchor="middle" fontSize={11} fill="white">→</SvgText>
          <SvgText x={225} y={100} textAnchor="middle" fontSize={9} fill="#0F6E56" fontWeight="600">다음 목적지</SvgText>
          <Rect x={8} y={8} width={85} height={24} rx={6} fill="white" opacity={0.92} />
          <SvgText x={16} y={24} fontSize={11} fill="#534AB7" fontWeight="700">경주 Day 3</SvgText>
        </Svg>
      </View>
      <Text style={styles.caption}>GPS 기반 이동 동선 자동 기록 중</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapBox: { borderRadius: radius.xxl, overflow: 'hidden', marginBottom: spacing.sm },
  caption: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
});
