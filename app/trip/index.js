import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { useTrip } from '../../src/context/TripContext';
import TopBar from '../../src/components/common/TopBar';
import SegmentedTabBar from '../../src/components/common/SegmentedTabBar';
import AppButton from '../../src/components/common/AppButton';
import Avatar from '../../src/components/common/Avatar';
import TripLogRow from '../../src/components/trip/TripLogRow';
import TripRouteMap from '../../src/components/trip/TripRouteMap';
import AddPlaceSubTab from '../../src/components/trip/AddPlaceSubTab';
import TransferSubTab from '../../src/components/trip/TransferSubTab';
import ExpenseRow from '../../src/components/common/ExpenseRow';
import Card from '../../src/components/common/Card';
import ExpenseAddModal from '../../src/components/modals/ExpenseAddModal';
import FriendInviteModal from '../../src/components/modals/FriendInviteModal';
import TripManageModal from '../../src/components/modals/TripManageModal';
import MemberManageModal from '../../src/components/modals/MemberManageModal';
import RouteShareModal from '../../src/components/modals/RouteShareModal';

const MAIN_TABS = [
  { key: 'exp', label: '지출내역' },
  { key: 'settle', label: '정산결과' },
  { key: 'map', label: '여행동선' },
];

const SUB_TABS = [
  { key: 'spend', label: '지출' },
  { key: 'place', label: '장소추가' },
  { key: 'transfer', label: '송금' },
];

export default function TripDetailScreen() {
  const router = useRouter();
  const { activeTrip, members, tripLog, expenses } = useTrip();

  const [mainTab, setMainTab] = useState('exp');
  const [subTab, setSubTab] = useState('spend');
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [manageVisible, setManageVisible] = useState(false);
  const [kickVisible, setKickVisible] = useState(false);
  const [routeShareVisible, setRouteShareVisible] = useState(false);

  if (!activeTrip) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TopBar title="여행" showBack onBack={() => router.back()} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>진행 중인 여행이 없어요</Text>
          <AppButton title="새 여행 만들기" onPress={() => router.push('/trip/new')} style={{ marginTop: spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar
        title={activeTrip.name}
        showBack
        onBack={() => router.back()}
        right={
          <>
            <Pressable style={styles.headerBtn} onPress={() => setInviteVisible(true)}>
              <Ionicons name="person-add-outline" size={14} color={colors.textPrimary} />
              <Text style={styles.headerBtnText}>초대</Text>
            </Pressable>
            <Pressable style={styles.headerIconBtn} onPress={() => setManageVisible(true)}>
              <Ionicons name="settings-outline" size={15} color={colors.textPrimary} />
            </Pressable>
          </>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 멤버 */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>여행 멤버</Text>
            <Pressable style={styles.smallAddBtn} onPress={() => setInviteVisible(true)}>
              <Ionicons name="add" size={12} color={colors.textPrimary} />
              <Text style={styles.smallAddText}>초대</Text>
            </Pressable>
          </View>
          <View style={styles.memberRow}>
            {members.map((m) => (
              <View key={m.id} style={styles.memberItem}>
                <Avatar label={m.short} colorKey={m.color} />
                <Text style={styles.memberName}>{m.name}</Text>
                {m.isMe && (
                  <View style={styles.mePill}>
                    <Text style={styles.mePillText}>나</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <SegmentedTabBar tabs={MAIN_TABS} activeKey={mainTab} onChange={setMainTab} />

          {mainTab === 'exp' && (
            <View>
              <SegmentedTabBar
                tabs={SUB_TABS}
                activeKey={subTab}
                onChange={setSubTab}
                style={styles.subTabBar}
              />

              {subTab === 'spend' && (
                <View>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>2026년 5월 7일 (목) — Day 3</Text>
                    <Pressable style={styles.smallAddBtn} onPress={() => setExpenseModalVisible(true)}>
                      <Ionicons name="add" size={11} color={colors.textPrimary} />
                      <Text style={styles.smallAddText}>지출 추가</Text>
                    </Pressable>
                  </View>
                  {tripLog.map((log, i) => (
                    <TripLogRow key={log.id} log={log} isLast={i === tripLog.length - 1} />
                  ))}
                  <AppButton
                    variant="outline"
                    title="지출 추가하기"
                    icon={<Ionicons name="receipt-outline" size={15} color={colors.tp} />}
                    onPress={() => setExpenseModalVisible(true)}
                    style={{ marginTop: spacing.md }}
                  />
                </View>
              )}

              {subTab === 'place' && <AddPlaceSubTab onDone={() => setSubTab('spend')} />}
              {subTab === 'transfer' && <TransferSubTab onDone={() => setSubTab('spend')} />}
            </View>
          )}

          {mainTab === 'settle' && (
            <View>
              <Card noPadding style={{ padding: spacing.lg, marginBottom: spacing.md }}>
                {expenses.map((e, i) => (
                  <ExpenseRow key={e.id} expense={e} isLast={i === expenses.length - 1} />
                ))}
              </Card>
              <AppButton
                title="정산 시작하기 →"
                icon={<Ionicons name="scale-outline" size={16} color={colors.white} />}
                onPress={() => router.push('/settle')}
              />
            </View>
          )}

          {mainTab === 'map' && <TripRouteMap />}
        </View>
      </ScrollView>

      <ExpenseAddModal visible={expenseModalVisible} onClose={() => setExpenseModalVisible(false)} />
      <FriendInviteModal visible={inviteVisible} onClose={() => setInviteVisible(false)} trip={activeTrip} />
      <TripManageModal
        visible={manageVisible}
        onClose={() => setManageVisible(false)}
        trip={activeTrip}
        onOpenInvite={() => setInviteVisible(true)}
        onOpenKick={() => setKickVisible(true)}
        onOpenRouteShare={() => setRouteShareVisible(true)}
      />
      <MemberManageModal visible={kickVisible} onClose={() => setKickVisible(false)} members={members} />
      <RouteShareModal visible={routeShareVisible} onClose={() => setRouteShareVisible(false)} trip={activeTrip} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scrollContent: { paddingBottom: 60 },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionLabel: { fontSize: fontSize.base, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase' },
  headerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.bgSecondary, borderWidth: 0.5, borderColor: colors.borderTertiary,
    borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 10,
  },
  headerBtnText: { fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '500' },
  headerIconBtn: {
    width: 32, height: 32, borderRadius: radius.round, backgroundColor: colors.bgSecondary,
    borderWidth: 0.5, borderColor: colors.borderTertiary, alignItems: 'center', justifyContent: 'center',
  },
  memberRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  memberItem: { alignItems: 'center', gap: 4 },
  memberName: { fontSize: fontSize.sm, color: colors.textSecondary },
  mePill: { backgroundColor: colors.tpLight, borderRadius: radius.pill, paddingVertical: 1, paddingHorizontal: 6 },
  mePillText: { fontSize: 9, color: colors.tpMid, fontWeight: '500' },
  divider: { height: 0.5, backgroundColor: colors.borderTertiary, marginTop: spacing.lg },
  subTabBar: { marginTop: -4 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  dateLabel: { fontSize: fontSize.base, color: colors.textSecondary },
  smallAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.bgSecondary, borderWidth: 0.5, borderColor: colors.borderTertiary,
    borderRadius: radius.sm, paddingVertical: 5, paddingHorizontal: 10,
  },
  smallAddText: { fontSize: fontSize.base, color: colors.textPrimary, fontWeight: '500' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { fontSize: fontSize.lg, color: colors.textSecondary },
});
