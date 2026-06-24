import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { SETTLE_MEMBERS, SETTLE_ROUTES } from '../../src/data/mockData';
import { useTrip } from '../../src/context/TripContext';
import { useToast } from '../../src/context/ToastContext';
import TopBar from '../../src/components/common/TopBar';
import Card from '../../src/components/common/Card';
import AppButton from '../../src/components/common/AppButton';
import SettleMemberCard from '../../src/components/settle/SettleMemberCard';
import SettleRouteCard from '../../src/components/settle/SettleRouteCard';
import KakaoPayModal from '../../src/components/modals/KakaoPayModal';
import { formatCurrency } from '../../src/utils/format';

export default function SettleScreen() {
  const router = useRouter();
  const { activeTrip, totalSpent, settleStatus, settleCompleted, completeSettle, revertSettle, nudgeMember, confirmMemberSettle } = useTrip();
  const toast = useToast();
  const [kakaoVisible, setKakaoVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handleNudge = (memberName) => {
    nudgeMember();
    toast.show(`${memberName}님에게 정산 독촉 알림을 보냈어요`);
  };

  const handleComplete = () => {
    completeSettle();
    toast.show('정산이 완료되었습니다! 🎉');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar
        title="정산하기"
        showBack
        onBack={() => router.back()}
        right={
          <Pressable style={styles.aiBtn} onPress={() => router.push('/settle/ai-chat')}>
            <Ionicons name="sparkles-outline" size={13} color={colors.tp} />
            <Text style={styles.aiBtnText}>AI 정산</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryHero}>
          <Text style={styles.summaryLabel}>{activeTrip?.name || '여행'} 총 지출</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalSpent)}</Text>
          <Text style={styles.summarySub}>{SETTLE_MEMBERS.length}명 참여 · AI 최적 분배 계산 완료</Text>
        </View>

        {settleCompleted && (
          <Card style={styles.doneBanner}>
            <Text style={styles.doneBannerTitle}>✅ 정산 완료</Text>
            <Text style={styles.doneBannerDesc}>이 여행의 정산이 모두 마무리됐어요</Text>
            <AppButton variant="secondary" title="정산 되돌리기" onPress={revertSettle} style={{ marginTop: spacing.sm }} />
          </Card>
        )}

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={styles.sectionTitle}>멤버별 정산 현황</Text>
          {SETTLE_MEMBERS.map((m) => (
            <SettleMemberCard
              key={m.id}
              member={m}
              status={settleStatus[m.id] || 'pending'}
              onNudge={() => handleNudge(m.name)}
              onConfirm={() => confirmMemberSettle(m.id)}
            />
          ))}
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.routeHeaderRow}>
            <Text style={styles.sectionTitle}>AI 추천 송금 경로</Text>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>최소 송금 횟수</Text>
            </View>
          </View>
          {SETTLE_ROUTES.map((route, i) => (
            <Pressable
              key={i}
              onPress={() => {
                setSelectedRoute(route);
                setKakaoVisible(true);
              }}
            >
              <SettleRouteCard route={route} />
            </Pressable>
          ))}
          <Text style={styles.routeHint}>경로를 눌러 카카오페이로 바로 송금할 수 있어요</Text>
        </Card>

        {!settleCompleted && (
          <AppButton title="정산 완료 처리" onPress={handleComplete} />
        )}
      </ScrollView>

      <KakaoPayModal
        visible={kakaoVisible}
        onClose={() => setKakaoVisible(false)}
        route={selectedRoute}
        onSent={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.tpLight, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 10,
  },
  aiBtnText: { fontSize: fontSize.sm, color: colors.tpMid, fontWeight: '600' },
  scrollContent: { padding: spacing.xl, paddingBottom: 60 },
  summaryHero: {
    backgroundColor: colors.tp, borderRadius: radius.xxl, padding: spacing.xl,
    alignItems: 'center', marginBottom: spacing.lg,
  },
  summaryLabel: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.85)' },
  summaryAmount: { fontSize: 32, fontWeight: '800', color: colors.white, marginTop: 4 },
  summarySub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  doneBanner: { backgroundColor: colors.ttLight, borderColor: colors.tt, marginBottom: spacing.md },
  doneBannerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.ttMid },
  doneBannerDesc: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
  routeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  aiPill: { backgroundColor: colors.tpLight, borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 9 },
  aiPillText: { fontSize: fontSize.sm, color: colors.tpMid, fontWeight: '500' },
  routeHint: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: spacing.sm },
});
