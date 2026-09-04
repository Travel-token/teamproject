import { FontAwesome6 } from '@expo/vector-icons';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
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
import { fetchTrips, createTrip } from '../api/trip';
import { useTheme } from '../theme/ThemeContext';
import { Trip } from '../types';
import { RootStackParamList, TabParamList } from '../navigation/types';
import NewTripModal from './NewTripModal';
import { getLocationPermissionStatus } from '../services/devicePermissions';
import { fetchCurrentRegionLabel } from '../services/currentRegion';

type Props = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, 'Settle'>,
    NativeStackScreenProps<RootStackParamList>
>;

export default function SettleHomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [modalVisible, setModalVisible] = useState(false);

  // 최초 진입 시 서버에서 여행 목록 조회. 실패 시 mock 데이터를 유지한다.
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchTrips();
        if (list.length > 0) setTrips(list);
      } catch (e) {
        console.warn('[trip] 목록 조회 실패, mock 데이터로 대체', e);
      }
    })();
  }, []);

  // "OO시 기준" 표시용 행정구역. GPS 권한 요청 자체는 여기서 하지 않는다 —
  // 권한 요청은 마이페이지의 GPS 토글에서만 하도록 몰아뒀고, 여기서는 이미
  // 허용된 상태인지만 확인해서 좌표를 읽는다.
  const [regionLabel, setRegionLabel] = useState<string | null>(null);
  const [regionLoading, setRegionLoading] = useState(false);
  const [gpsGranted, setGpsGranted] = useState(false);

  // 마이페이지에서 GPS 권한을 껐다 켰다 할 수 있으니, 이 탭에 포커스될 때마다
  // 권한을 다시 확인해서 최신 상태로 맞춘다.
  useFocusEffect(
      useCallback(() => {
        let cancelled = false;

        (async () => {
          const { status } = await getLocationPermissionStatus();
          if (cancelled) return;

          if (status !== 'granted') {
            setGpsGranted(false);
            setRegionLabel(null);
            return;
          }

          setGpsGranted(true);
          setRegionLoading(true);
          const label = await fetchCurrentRegionLabel();
          if (!cancelled) {
            setRegionLabel(label);
            setRegionLoading(false);
          }
        })();

        return () => {
          cancelled = true;
        };
      }, []),
  );

  const locationLabelText = !gpsGranted
      ? 'GPS 위치 꺼짐 · 탭해서 켜기'
      : regionLoading
          ? '위치 확인 중...'
          : regionLabel
              ? `${regionLabel} 기준`
              : '위치를 확인할 수 없어요';

  // 여행 생성: 낙관적 업데이트 후 서버 응답으로 치환, 실패 시 롤백
  const addTrip = async (payload: {
    name: string;
    region: string;
    startDate: string | null;
    endDate: string | null;
  }) => {
    // 서버 스펙상 날짜가 필수이므로 미선택 시 오늘 날짜로 보정
    const today = new Date().toISOString().slice(0, 10);
    const startDate = payload.startDate ?? today;
    const endDate = payload.endDate ?? startDate;

    const tempId = `temp-${Date.now()}`;
    const tempTrip: Trip = {
      id: tempId,
      name: payload.name,
      region: payload.region,
      emoji: '🧳',
      status: '진행 중',
      dateLabel: '저장 중...',
      days: 1,
      myExpense: 0,
      totalExpense: 0,
      members: [{ id: 'me', name: '나' }],
      collage: [],
    };
    setTrips((prev) => [tempTrip, ...prev]);

    try {
      const saved = await createTrip({
        name: payload.name,
        region: payload.region,
        startDate,
        endDate,
        creatorName: '나',
      });
      setTrips((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
    } catch (e) {
      setTrips((prev) => prev.filter((t) => t.id !== tempId));
      console.warn('[trip] 생성 실패', e);
    }
  };

  return (
      <View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View>
            <Pressable
                onPress={() => {
                  if (!gpsGranted) navigation.navigate('MyPage');
                }}
                style={styles.locationRow}
            >
              <View style={[styles.locDot, { backgroundColor: gpsGranted ? colors.txPrimary : colors.txMuted }]} />
              <Text style={{ fontSize: 12, color: colors.txMuted }}>{locationLabelText}</Text>
            </Pressable>
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