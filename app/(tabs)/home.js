import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { useTrip } from '../../src/context/TripContext';
import ActiveTripHeroCard from '../../src/components/home/ActiveTripHeroCard';
import GpsBanner from '../../src/components/home/GpsBanner';
import PaymentDetectBanner from '../../src/components/home/PaymentDetectBanner';
import ExpenseRow from '../../src/components/common/ExpenseRow';
import Card from '../../src/components/common/Card';
import AppButton from '../../src/components/common/AppButton';
import ExpenseAddModal from '../../src/components/modals/ExpenseAddModal';
import NotifyModal from '../../src/components/modals/NotifyModal';

export default function HomeScreen() {
  const router = useRouter();
  const { activeTrip, expenses, notifications, gpsLocationLabel } = useTrip();
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [paymentBannerVisible, setPaymentBannerVisible] = useState(true);

  const recentExpenses = expenses.slice(0, 3);
  const unreadCount = notifications.length;

  // 안드로이드 결제 알림 감지 mock (실제로는 알림 리스너에서 들어옴)
  const mockPayment = {
    merchant: '교동쌈밥',
    amount: 48000,
    dateLabel: '2026.05.07 12:30',
    cardName: '하나카드',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 상단 헤더: 로고 + GPS 라벨 / 알림 / 프로필 */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.appTitle}>Travel Token</Text>
          <View style={styles.gpsRow}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>{gpsLocationLabel}</Text>
          </View>
        </View>
        <Pressable style={styles.iconBtn} onPress={() => setNotifyVisible(true)}>
          <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable style={styles.avatarBtn} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={{ fontSize: 15 }}>🧳</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <GpsBanner placeName="불국사" onRecordExpense={() => setExpenseModalVisible(true)} />

        {paymentBannerVisible && (
          <PaymentDetectBanner
            payment={mockPayment}
            onRegister={() => setExpenseModalVisible(true)}
            onDismiss={() => setPaymentBannerVisible(false)}
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>진행 중인 여행</Text>
          <ActiveTripHeroCard trip={activeTrip} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>빠른 실행</Text>
          <Card onPress={() => router.push('/settle')} style={styles.quickActionCard}>
            <View style={styles.quickActionRow}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="calculator-outline" size={22} color={colors.tt} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickActionTitle}>바로 정산하기</Text>
                <Text style={styles.quickActionDesc}>여행 없이 빠르게 · AI 최적 송금 계산</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>최근 지출</Text>
            <Pressable onPress={() => router.push('/trip/expenses')}>
              <Text style={styles.seeAll}>전체 보기 ›</Text>
            </Pressable>
          </View>
          <Card noPadding style={{ padding: spacing.lg }}>
            {recentExpenses.map((e, i) => (
              <ExpenseRow key={e.id} expense={e} isLast={i === recentExpenses.length - 1} />
            ))}
          </Card>
        </View>
      </ScrollView>

      <ExpenseAddModal visible={expenseModalVisible} onClose={() => setExpenseModalVisible(false)} />
      <NotifyModal visible={notifyVisible} onClose={() => setNotifyVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderTertiary,
  },
  appTitle: { fontSize: fontSize.h2, fontWeight: '700', color: colors.textPrimary },
  gpsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  gpsDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.tt },
  gpsText: { fontSize: fontSize.base, color: colors.textSecondary },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.round,
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.tc,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '600' },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.round,
    backgroundColor: colors.tpLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingBottom: 100 },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionLabel: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  seeAll: { fontSize: fontSize.base, color: colors.textSecondary },
  quickActionCard: { padding: spacing.lg },
  quickActionRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.ttLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: { fontSize: fontSize.ml, fontWeight: '700', color: colors.textPrimary },
  quickActionDesc: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 3 },
});
