import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Rect, Ellipse, Circle, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { formatCurrency, formatTripDateRange, calcPercent } from '../../utils/format';
import StatBox from '../common/StatBox';

export default function ActiveTripHeroCard({ trip }) {
  const router = useRouter();
  if (!trip) return null;

  const budgetPct = calcPercent(trip.totalSpent, trip.budget);

  return (
    <Pressable style={styles.card} onPress={() => router.push('/trip')}>
      {/* 그라데이션 배너 + 일러스트 (원본 SVG pagoda/벚꽃 장식을 단순화해 재현) */}
      <View style={styles.banner}>
        <Svg width="100%" height="100%" viewBox="0 0 350 120" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#7F77DD" />
              <Stop offset="100%" stopColor="#A89EF5" />
            </LinearGradient>
          </Defs>
          <Rect width="350" height="120" fill="url(#sky)" />
          <Ellipse cx="80" cy="120" rx="120" ry="50" fill="rgba(255,255,255,0.07)" />
          <Ellipse cx="300" cy="120" rx="100" ry="40" fill="rgba(255,255,255,0.05)" />
          <Polygon points="55,30 30,46 80,46" fill="rgba(255,255,255,0.9)" />
          <Rect x="71" y="46" width="18" height="30" fill="rgba(255,255,255,0.9)" />
          <Circle cx="160" cy="25" r="5" fill="#FFB7C5" />
          <Circle cx="168" cy="20" r="4" fill="#FFB7C5" />
          <Circle cx="220" cy="35" r="4" fill="#FFB7C5" />
          <Circle cx="290" cy="25" r="18" fill="rgba(255,255,200,0.15)" />
          <Circle cx="290" cy="25" r="12" fill="rgba(255,255,200,0.2)" />
        </Svg>

        <View style={styles.bannerContent}>
          <View style={styles.bannerTop}>
            <View>
              <Text style={styles.tripName}>
                {trip.emoji} {trip.name}
              </Text>
              <Text style={styles.tripDate}>
                {formatTripDateRange(trip.startDate, trip.endDate, trip.nights)}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>● 진행 중</Text>
            </View>
          </View>
          <View style={styles.placeTags}>
            {trip.highlightPlaces?.map((p) => (
              <View key={p} style={styles.placeTag}>
                <Text style={styles.placeTagText}>📍 {p}</Text>
              </View>
            ))}
            {trip.placesVisited > (trip.highlightPlaces?.length || 0) && (
              <View style={[styles.placeTag, styles.placeTagMuted]}>
                <Text style={styles.placeTagTextMuted}>
                  +{trip.placesVisited - (trip.highlightPlaces?.length || 0)}곳
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 통계 + 예산 사용률 */}
      <View style={styles.body}>
        <View style={styles.statsRow}>
          <StatBox label="총 지출" value={formatCurrency(trip.totalSpent)} valueStyle={styles.statValueSm} />
          <StatBox label="방문 장소" value={`${trip.placesVisited}`} valueStyle={styles.statValueSm} />
          <StatBox label="멤버" value={`${trip.members?.length || 0}명`} valueStyle={styles.statValueSm} />
        </View>
        <View>
          <View style={styles.budgetLabelRow}>
            <Text style={styles.budgetLabel}>예산 사용률</Text>
            <Text style={styles.budgetLabel}>{budgetPct}%</Text>
          </View>
          <View style={styles.budgetBarBg}>
            <View style={[styles.budgetBarFill, { width: `${Math.min(budgetPct, 100)}%` }]} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgPrimary,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  banner: { height: 120, position: 'relative' },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripName: { fontSize: fontSize.title, fontWeight: '700', color: colors.white },
  tripDate: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statusPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  statusText: { fontSize: fontSize.sm, color: colors.white, fontWeight: '500' },
  placeTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  placeTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  placeTagMuted: { backgroundColor: 'rgba(255,255,255,0.15)' },
  placeTagText: { fontSize: fontSize.sm, color: colors.white, fontWeight: '500' },
  placeTagTextMuted: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  body: { padding: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statValueSm: { fontSize: fontSize.title },
  budgetLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  budgetLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  budgetBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgSecondary,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.tp,
  },
});
