import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Rect, Polygon, Circle } from 'react-native-svg';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { formatCurrency, formatTripDateRange } from '../../utils/format';

const STATUS_LABEL = { ongoing: '진행 중', ended: '종료' };

const GRADIENT_BY_STATUS = {
  ongoing: ['#7F77DD', '#534AB7'],
  ended: ['#5B8FD4', '#2D5FA6'],
};

export default function TripListCard({ trip, onPress, onShareRoute, onManage, compact = false }) {
  const isOngoing = trip.status === 'ongoing';

  return (
    <Pressable style={[styles.card, compact && { opacity: 0.85 }]} onPress={onPress}>
      <View style={[styles.banner, { height: compact ? 70 : 90, backgroundColor: GRADIENT_BY_STATUS[trip.status]?.[0] || colors.tp }]}>
        <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <Circle cx="20%" cy="100%" r="60" fill="rgba(255,255,255,0.08)" />
        </Svg>
        <View style={styles.bannerContent}>
          <Text style={styles.tripName}>
            {trip.emoji} {trip.name}
          </Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{isOngoing ? '● ' : ''}{STATUS_LABEL[trip.status]}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.subInfo}>
          {formatTripDateRange(trip.startDate, trip.endDate, trip.nights ?? 0)} · {trip.memberCount ?? trip.members?.length}명 · {trip.region}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>총 지출</Text>
            <Text style={styles.statValue}>{formatCurrency(trip.totalSpent)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>방문 장소</Text>
            <Text style={styles.statValue}>{trip.placesVisited}곳</Text>
          </View>
        </View>

        {isOngoing && (onShareRoute || onManage) && (
          <View style={styles.actionRow}>
            {onShareRoute && (
              <Pressable style={styles.actionBtn} onPress={onShareRoute}>
                <Text style={styles.actionText}>동선 공유</Text>
              </Pressable>
            )}
            {onManage && (
              <Pressable style={styles.actionBtn} onPress={onManage}>
                <Text style={styles.actionText}>여행 관리</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgPrimary,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
    marginBottom: spacing.md,
  },
  banner: { position: 'relative', justifyContent: 'center' },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md + 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripName: { fontSize: fontSize.title, fontWeight: '700', color: colors.white },
  statusPill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 10 },
  statusText: { fontSize: fontSize.sm, color: colors.white, fontWeight: '500' },
  body: { padding: spacing.md + 2 },
  subInfo: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: { flex: 1, backgroundColor: colors.bgSecondary, borderRadius: radius.lg, padding: 10 },
  statLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 2 },
  statValue: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
  },
  actionText: { fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: '500' },
});
