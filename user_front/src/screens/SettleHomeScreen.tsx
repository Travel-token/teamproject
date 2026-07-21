import { FontAwesome6 } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import Fab from '../components/Fab';
import IconCircleButton from '../components/IconCircleButton';
import { trips as initialTrips, formatWon } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { Trip } from '../types';
import { RootStackParamList, TabParamList } from '../navigation/types';
import NewTripModal from './NewTripModal';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settle'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function SettleHomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [modalVisible, setModalVisible] = useState(false);

  const addTrip = (name: string, region: string) => {
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name,
      region,
      emoji: '🧳',
      status: '진행 중',
      dateLabel: '날짜 미정',
      days: 1,
      myExpense: 0,
      totalExpense: 0,
      members: [{ id: 'me', name: '나' }],
      collage: [],
    };
    setTrips((prev) => [newTrip, ...prev]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View>
          <View style={styles.locationRow}>
            <View style={[styles.locDot, { backgroundColor: colors.txPrimary }]} />
            <Text style={{ fontSize: 12, color: colors.txMuted }}>경주시 기준</Text>
          </View>
          <Text style={[styles.pageTitle, { color: colors.txPrimary }]}>정산</Text>
        </View>
        <View style={styles.topRight}>
          <IconCircleButton icon="bell" showDot />
          <Pressable onPress={() => navigation.navigate('MyPage')}>
            <Avatar label="나" size={34} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Pressable
          onPress={() => navigation.navigate('RoomSettle', { tripId: trips[0]?.id ?? 'jeju' })}
          style={[styles.oweBanner, { backgroundColor: colors.bgOwe }]}
        >
          <Text style={styles.oweEmoji}>💸</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.oweLabel, { color: colors.txOweLabel }]}>지수에게 보내야 할 금액</Text>
            <Text style={[styles.oweAmount, { color: colors.txOweAmount }]}>24,333원</Text>
          </View>
          <FontAwesome6 name="chevron-right" size={12} color={colors.txOweSub} />
        </Pressable>

        <View style={styles.summaryRow}>
          <SummaryStat label="내 지출" value="47,333원" />
          <View style={[styles.summaryDivider, { backgroundColor: colors.bdCard }]} />
          <SummaryStat label="총 지출" value="142,000원" />
          <View style={[styles.summaryDivider, { backgroundColor: colors.bdCard }]} />
          <SummaryStat label="최근 여행" value="제주도 🏝️" />
        </View>

        <View style={styles.sectionHd}>
          <Text style={[styles.sectionTitle, { color: colors.txPrimary }]}>진행 중인 여행</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tripScroll}>
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onPress={() => navigation.navigate('RoomExpense', { tripId: trip.id })} />
          ))}
        </ScrollView>
      </ScrollView>

      <Fab label="여행 추가하기" onPress={() => setModalVisible(true)} />

      <NewTripModal visible={modalVisible} onClose={() => setModalVisible(false)} onCreate={addTrip} />
    </View>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryItem}>
      <Text style={{ fontSize: 10, color: colors.txMuted }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.txPrimary, marginTop: 3 }}>{value}</Text>
    </View>
  );
}

function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.tripCard, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}>
      {trip.collage.length ? (
        <View style={styles.collage}>
          {trip.collage.map((e, i) => (
            <View key={i} style={[styles.collageCell, { backgroundColor: colors.bgCollage[i % 4] }]}>
              <Text style={{ fontSize: 20 }}>{e}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.noImg, { backgroundColor: colors.bgCard2 }]}>
          <Text style={{ fontSize: 22 }}>📷</Text>
          <Text style={{ fontSize: 11, color: colors.txMuted, marginTop: 4 }}>이미지를 추가하세요</Text>
        </View>
      )}
      <View style={styles.tripBody}>
        <View style={[styles.tripBadge, { backgroundColor: colors.bgBadgeLive }]}>
          <Text style={styles.tripBadgeText}>{trip.status}</Text>
        </View>
        <Text style={[styles.tripName, { color: colors.txPrimary }]}>{trip.name}</Text>
        <Text style={[styles.tripDate, { color: colors.txMuted }]}>{trip.dateLabel}</Text>
        <View style={styles.tripBottom}>
          <Text style={{ fontSize: 12, color: colors.txSecondary }}>
            지출 <Text style={{ fontWeight: '700', color: colors.txPrimary }}>{formatWon(trip.totalExpense)}</Text>
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {trip.members.slice(0, 3).map((m, i) => (
              <View key={m.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                <Avatar label={m.name} size={22} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  locDot: { width: 6, height: 6, borderRadius: 3 },
  pageTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  oweBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 18,
    gap: 12,
  },
  oweEmoji: { fontSize: 26 },
  oweLabel: { fontSize: 12, marginBottom: 3 },
  oweAmount: { fontSize: 18, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 14 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 0.5, height: 28 },
  sectionHd: { paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  tripScroll: { paddingHorizontal: 20, gap: 12 },
  tripCard: { width: 220, borderRadius: 18, borderWidth: 0.5, overflow: 'hidden' },
  collage: { flexDirection: 'row', flexWrap: 'wrap', height: 96 },
  collageCell: { width: '50%', height: '50%', alignItems: 'center', justifyContent: 'center' },
  noImg: { height: 96, alignItems: 'center', justifyContent: 'center' },
  tripBody: { padding: 14 },
  tripBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  tripBadgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
  tripName: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  tripDate: { fontSize: 11, marginBottom: 10 },
  tripBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
