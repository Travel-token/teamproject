import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, fontSize, spacing } from '../../../src/constants/theme';
import { PAST_TRIPS } from '../../../src/data/mockData';
import TopBar from '../../../src/components/common/TopBar';
import Card from '../../../src/components/common/Card';
import StatBox from '../../../src/components/common/StatBox';
import AppButton from '../../../src/components/common/AppButton';
import { formatCurrency, formatTripDateRange } from '../../../src/utils/format';
import { useToast } from '../../../src/context/ToastContext';

export default function PastTripDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const toast = useToast();

  // 백엔드 연동 시: GET /api/trips/{id} 로 종료된 여행 상세를 조회합니다.
  const trip = PAST_TRIPS.find((t) => t.id === id) || PAST_TRIPS[0];

  return (
    
    <SafeAreaView style={styles.safe} edges={['top']}>
      
      <TopBar title={trip.name} showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroRow}>
          <Text style={styles.heroEmoji}>{trip.emoji}</Text>
          <View>
            <Text style={styles.heroTitle}>{trip.name}</Text>
            <Text style={styles.heroSub}>
              {formatTripDateRange(trip.startDate, trip.endDate, Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000))} · {trip.region}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatBox label="총 지출" value={formatCurrency(trip.totalSpent)} />
          <StatBox label="방문 장소" value={`${trip.placesVisited}곳`} />
          <StatBox label="멤버" value={`${trip.memberCount}명`} />
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.cardTitle}>정산 상태</Text>
          <Text style={styles.cardDesc}>이 여행의 정산은 모두 완료되었습니다 ✅</Text>
        </Card>

        <AppButton
          variant="secondary"
          title="이 여행 분석 다시 보기"
          onPress={() => toast.show('종료된 여행의 상세 분석은 추후 지원될 예정이에요')}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scrollContent: { padding: spacing.xl, paddingBottom: 60 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  heroEmoji: { fontSize: 40 },
  heroTitle: { fontSize: fontSize.h1, fontWeight: '700', color: colors.textPrimary },
  heroSub: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  cardDesc: { fontSize: fontSize.base, color: colors.textSecondary },
});
