import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { CAT_DATA } from '../../src/data/mockData';
import { useTrip } from '../../src/context/TripContext';
import TopBar from '../../src/components/common/TopBar';
import Card from '../../src/components/common/Card';
import StatBox from '../../src/components/common/StatBox';
import CategoryDonutChart from '../../src/components/trip/CategoryDonutChart';
import { formatCurrency, calcPercent } from '../../src/utils/format';

const COLOR_DOT = { tp: colors.tp, tt: colors.tt, ta: colors.ta, tc: colors.tc };

export default function StatsScreen() {
  const router = useRouter();
  const { activeTrip, totalSpent, members } = useTrip();

  const catTotal = CAT_DATA.reduce((s, c) => s + c.total, 0);
  const memberTotal = members.reduce((s, m) => s + m.paid, 0) || 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="여행 분석" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <StatBox label="총 지출" value={formatCurrency(totalSpent)} valueStyle={{ fontSize: fontSize.xl }} />
          <StatBox label="1인당 평균" value={formatCurrency(Math.round(totalSpent / (members.length || 1)))} valueStyle={{ fontSize: fontSize.xl }} />
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>카테고리별 지출</Text>
          <View style={styles.donutRow}>
            <CategoryDonutChart data={CAT_DATA} />
            <View style={styles.legend}>
              {CAT_DATA.map((c) => (
                <View key={c.cat} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: COLOR_DOT[c.colorKey] }]} />
                  <Text style={styles.legendLabel}>{c.label}</Text>
                  <Text style={styles.legendPct}>{calcPercent(c.total, catTotal)}%</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>멤버별 결제 비중</Text>
          {members.map((m) => {
            const pct = calcPercent(m.paid, memberTotal);
            return (
              <View key={m.id} style={styles.memberRow}>
                <Text style={styles.memberName}>{m.isMe ? `${m.name} (나)` : m.name}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: COLOR_DOT[m.color] || colors.tp }]} />
                </View>
                <Text style={styles.memberAmount}>{formatCurrency(m.paid)}</Text>
              </View>
            );
          })}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>예산 대비 지출</Text>
          {activeTrip?.budget ? (
            <>
              <View style={styles.budgetBarBg}>
                <View
                  style={[
                    styles.budgetBarFill,
                    { width: `${Math.min(calcPercent(totalSpent, activeTrip.budget), 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.budgetText}>
                {formatCurrency(totalSpent)} / {formatCurrency(activeTrip.budget)} 사용 (
                {calcPercent(totalSpent, activeTrip.budget)}%)
              </Text>
            </>
          ) : (
            <Text style={styles.noBudgetText}>설정된 예산이 없어요</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scrollContent: { padding: spacing.xl, paddingBottom: 60, gap: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: fontSize.base, color: colors.textPrimary },
  legendPct: { fontSize: fontSize.base, color: colors.textSecondary, fontWeight: '600' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  memberName: { fontSize: fontSize.base, color: colors.textPrimary, width: 60 },
  barTrack: { flex: 1, height: 8, backgroundColor: colors.bgSecondary, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  memberAmount: { fontSize: fontSize.sm, color: colors.textSecondary, width: 70, textAlign: 'right' },
  budgetBarBg: { height: 10, borderRadius: 5, backgroundColor: colors.bgSecondary, overflow: 'hidden', marginBottom: spacing.sm },
  budgetBarFill: { height: '100%', borderRadius: 5, backgroundColor: colors.tp },
  budgetText: { fontSize: fontSize.base, color: colors.textSecondary },
  noBudgetText: { fontSize: fontSize.base, color: colors.textTertiary },
});
