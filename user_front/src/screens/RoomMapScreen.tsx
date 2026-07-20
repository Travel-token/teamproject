import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import BottomSheetModal from '../components/BottomSheetModal';
import { CancelButton, SubmitButton } from '../components/FormBits';
import IconCircleButton from '../components/IconCircleButton';
import RoomMenuOverlay from '../components/RoomMenuOverlay';
import RoomTabBar, { RoomTabKey } from '../components/RoomTabBar';
import TripHero from '../components/TripHero';
import { places as initialPlaces, trips } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { PlaceItem } from '../types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomMap'>;

const GALLERY = ['🌊', '🌿', '🌅', '🍊', '🐴', '🏖️'];

export default function RoomMapScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const baseTrip = trips.find((t) => t.id === route.params.tripId) ?? trips[0];
  const [tripEmoji, setTripEmoji] = useState(baseTrip.emoji);
  const [tripName, setTripName] = useState(baseTrip.name);
  const trip = { ...baseTrip, emoji: tripEmoji, name: tripName };
  const [spots, setSpots] = useState<PlaceItem[]>(initialPlaces);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const onRoomTabChange = (key: RoomTabKey) => {
    if (key === 'expense') navigation.replace('RoomExpense', { tripId: trip.id });
    else if (key === 'settle') navigation.replace('RoomSettle', { tripId: trip.id });
  };

  const renderSpot = ({ item, getIndex, drag, isActive }: RenderItemParams<PlaceItem>) => {
    const index = getIndex() ?? 0;
    return (
      <ScaleDecorator>
        <View style={styles.spotRow}>
          <View style={styles.spotLine}>
            <View style={[styles.spotNum, { backgroundColor: colors.bgChipActive }]}>
              <Text style={styles.spotNumText}>{index + 1}</Text>
            </View>
            {index < spots.length - 1 && <View style={[styles.spotConnector, { backgroundColor: colors.bdCard }]} />}
          </View>
          <View
            style={[
              styles.spotCard,
              { backgroundColor: colors.bgCard, borderColor: colors.bdCard, opacity: isActive ? 0.85 : 1 },
            ]}
          >
            <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.spotName, { color: colors.txPrimary }]}>{item.name}</Text>
              <Text style={[styles.spotMeta, { color: colors.txMuted }]}>
                {item.timeLabel} · {item.withMembers}
              </Text>
            </View>
            {/* 길게 누른 채로 드래그하면 순서가 바뀝니다 (react-native-draggable-flatlist) */}
            <Pressable onLongPress={drag} disabled={isActive} hitSlop={8} style={styles.dragHandle}>
              <FontAwesome6 name="grip-lines" size={14} color={colors.txMuted} />
            </Pressable>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>
      <View style={styles.topBar}>
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
      <RoomTabBar active="map" onChange={onRoomTabChange} />

      {/* 원본의 SVG 동선지도는 좌표 기반 캔버스 렌더링이라 RN에서는
          드래그로 순서를 바꿀 수 있는 리스트로 대체 구현했습니다. */}
      <DraggableFlatList
        data={spots}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => setSpots(data)}
        renderItem={renderSpot}
        ListHeaderComponent={
          <View style={styles.routeHd}>
            <Text style={[styles.sectionTitle, { color: colors.txPrimary }]}>방문 순서</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome6 name="arrows-up-down" size={10} color={colors.txMuted} />
              <Text style={{ fontSize: 11, color: colors.txMuted, marginLeft: 4 }}>꾹 눌러서 순서를 바꿀 수 있어요</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View>
            <View style={styles.galleryHd}>
              <Text style={[styles.sectionTitle, { color: colors.txPrimary }]}>갤러리</Text>
              <Pressable onPress={() => setGalleryOpen(true)}>
                <Text style={{ fontSize: 12, color: colors.txMuted }}>전체보기</Text>
              </Pressable>
            </View>
            <View style={styles.galleryRow}>
              {GALLERY.slice(0, 3).map((e, i) => (
                <View key={i} style={[styles.galleryItem, { backgroundColor: colors.bgCollage[i % 4] }]}>
                  <Text style={{ fontSize: 26 }}>{e}</Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => Alert.alert('동선 지도 공유하기')}
              style={[styles.shareBtn, { backgroundColor: colors.bgCard2, borderColor: colors.bdCard }]}
            >
              <FontAwesome6 name="share-nodes" size={13} color={colors.txSecondary} />
              <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '600', color: colors.txSecondary }}>
                동선 지도 공유하기
              </Text>
            </Pressable>
          </View>
        }
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <BottomSheetModal visible={galleryOpen} onClose={() => setGalleryOpen(false)} title="갤러리 전체">
        <View style={styles.galleryGrid}>
          {GALLERY.map((e, i) => (
            <View key={i} style={[styles.galleryGridItem, { backgroundColor: colors.bgCollage[i % 4] }]}>
              <Text style={{ fontSize: 28 }}>{e}</Text>
            </View>
          ))}
        </View>
        <SubmitButton label="사진 추가하기" onPress={() => Alert.alert('사진 추가')} />
        <CancelButton label="닫기" onPress={() => setGalleryOpen(false)} />
      </BottomSheetModal>

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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  backBtn: { marginRight: 10 },
  tripHead: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginLeft: 2 },
  tripEmojiSm: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tripHdName: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  routeHd: { paddingHorizontal: 20, marginTop: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
  spotRow: { flexDirection: 'row', marginBottom: 4, paddingHorizontal: 20 },
  dragHandle: { paddingLeft: 10, paddingVertical: 4 },
  spotLine: { alignItems: 'center', width: 26 },
  spotNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  spotNumText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  spotConnector: { width: 2, flex: 1, minHeight: 24, marginTop: 2 },
  spotCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 10,
    marginLeft: 6,
  },
  spotName: { fontSize: 13, fontWeight: '700' },
  spotMeta: { fontSize: 11, marginTop: 2 },
  galleryHd: { paddingHorizontal: 20, marginTop: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  galleryRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  galleryItem: { flex: 1, height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, paddingVertical: 13, borderRadius: 14, borderWidth: 0.5 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  galleryGridItem: { width: '31%', height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
