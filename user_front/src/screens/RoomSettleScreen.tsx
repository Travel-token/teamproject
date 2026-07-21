import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import BottomSheetModal from '../components/BottomSheetModal';
import { CancelButton, SubmitButton } from '../components/FormBits';
import IconCircleButton from '../components/IconCircleButton';
import RoomMenuOverlay from '../components/RoomMenuOverlay';
import RoomTabBar, { RoomTabKey } from '../components/RoomTabBar';
import { useToast } from '../components/Toast';
import TripHero from '../components/TripHero';
import { balances, formatWon, trips } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { BalanceRow } from '../types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomSettle'>;

export default function RoomSettleScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const baseTrip = trips.find((t) => t.id === route.params.tripId) ?? trips[0];
  const [tripEmoji, setTripEmoji] = useState(baseTrip.emoji);
  const [tripName, setTripName] = useState(baseTrip.name);
  const trip = { ...baseTrip, emoji: tripEmoji, name: tripName };
  const [selected, setSelected] = useState<BalanceRow | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const onRoomTabChange = (key: RoomTabKey) => {
    if (key === 'expense') navigation.replace('RoomExpense', { tripId: trip.id });
    else if (key === 'map') navigation.replace('RoomMap', { tripId: trip.id });
  };

  const me = balances.find((b) => b.isMe);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome6 name="chevron-left" size={16} color={colors.txPrimary} />
        </Pressable>
        <View style={styles.tripHead}>
          <View style={[styles.tripEmojiSm, { backgroundColor: colors.bgCard2 }]}>
            <Text style={{ fontSize: 17 }}>{trip.emoji}</Text>
          </View>
          <Text style={[styles.tripHdName, { color: colors.txPrimary }]} numberOfLines={1}>
            {trip.name}
          </Text>
        </View>
        <IconCircleButton icon="ellipsis" onPress={() => setMenuOpen(true)} />
      </View>

      <TripHero trip={trip} />
      <RoomTabBar active="settle" onChange={onRoomTabChange} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {me && me.amount !== 0 && (
          <Pressable
            onPress={() => setSelected({ ...me, name: '지수' })}
            style={[styles.myBanner, { backgroundColor: colors.bgSettleBanner }]}
          >
            <Text style={styles.myBannerEmoji}>💸</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.myBannerMain, { color: colors.txPrimary }]}>지수에게 보내야 해요</Text>
              <Text style={[styles.myBannerAmt, { color: colors.txSettleAmt }]}>{formatWon(Math.abs(me.amount))}</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={13} color={colors.txMuted} />
          </Pressable>
        )}

        <Pressable
          onPress={() => Alert.alert('전체 정산 보기')}
          style={[styles.viewAllBtn, { borderColor: colors.bdCard }]}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.txSecondary }}>전체 정산 보기</Text>
        </Pressable>

        <View style={styles.sectionHd}>
          <Text style={[styles.sectionTitle, { color: colors.txPrimary }]}>Balances</Text>
          <IconCircleButton icon="arrow-up-arrow-down" size={28} />
        </View>

        <View style={{ paddingHorizontal: 20, gap: 8 }}>
          {balances.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => b.amount !== 0 && setSelected(b)}
              style={[styles.balanceRow, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}
            >
              <Avatar label={b.name} size={32} faded={b.amount === 0} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.balanceName, { color: colors.txPrimary }]}>{b.name}</Text>
                {b.isMe && <Text style={{ fontSize: 10, color: colors.txMuted }}>Me</Text>}
              </View>
              <Text
                style={[
                  styles.balanceAmt,
                  {
                    color: b.amount > 0 ? colors.positive : b.amount < 0 ? colors.danger : colors.txMuted,
                  },
                ]}
              >
                {b.amount === 0 ? '0원' : `${b.amount > 0 ? '+' : '−'}${formatWon(Math.abs(b.amount)).replace('원', '')}원`}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <SettleModal row={selected} onClose={() => setSelected(null)} />

      <RoomMenuOverlay
        menuOpen={menuOpen}
        onCloseMenu={() => setMenuOpen(false)}
        emoji={trip.emoji}
        name={trip.name}
        dateLabel={trip.dateLabel}
        onSaveTripInfo={(e, n) => {
          setTripEmoji(e);
          setTripName(n);
        }}
      />
    </View>
  );
}

function SettleModal({ row, onClose }: { row: BalanceRow | null; onClose: () => void }) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  return (
    <BottomSheetModal visible={!!row} onClose={onClose} title="송금 확인">
      {row && (
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.txPrimary, textAlign: 'center', marginBottom: 10 }}>
            {row.amount < 0 ? `나 → ${row.name}` : `${row.name} → 나`}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.txPrimary, textAlign: 'center', marginBottom: 16 }}>
            {formatWon(Math.abs(row.amount))}
          </Text>
          <View style={[styles.accountBox, { backgroundColor: colors.bgCard2 }]}>
            <Text style={{ fontSize: 13, color: colors.txSecondary }}>카카오뱅크 3333-04-1234567</Text>
          </View>
          <Pressable
            onPress={() => {
              showToast(`💛 카카오페이로 이동해요 (${row.name}에게 ${formatWon(Math.abs(row.amount))})`);
            }}
            style={[styles.kakaoBtn, { backgroundColor: colors.bgPayBtn }]}
          >
            <FontAwesome6 name="comment" size={13} color="#FFFFFF" />
            <Text style={styles.kakaoLabel}>카카오페이로 송금하기</Text>
          </Pressable>
          <SubmitButton
            label="송금 저장 (송금내역에 자동 기록)"
            onPress={() => {
              showToast('💸 송금내역에 자동 저장됐어요');
              onClose();
            }}
          />
          <CancelButton onPress={onClose} />
        </View>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  backBtn: { marginRight: 10 },
  tripHead: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginLeft: 2 },
  tripEmojiSm: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tripHdName: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  myBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 12, marginBottom: 10, padding: 16, borderRadius: 16, gap: 12 },
  myBannerEmoji: { fontSize: 22 },
  myBannerMain: { fontSize: 13, fontWeight: '600' },
  myBannerAmt: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  viewAllBtn: { marginHorizontal: 20, marginBottom: 18, paddingVertical: 11, borderRadius: 12, borderWidth: 0.5, alignItems: 'center' },
  sectionHd: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 0.5 },
  balanceName: { fontSize: 13, fontWeight: '700' },
  balanceAmt: { fontSize: 14, fontWeight: '700' },
  accountBox: { padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 14 },
  kakaoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14, marginBottom: 8 },
  kakaoLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
