import { useFocusEffect } from '@react-navigation/native';
import { apiError } from '../utils/apiError';
import ApiImage from '../components/ApiImage';
import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, Platform, Pressable, Share, StyleSheet, Text, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import BottomSheetModal from '../components/BottomSheetModal';
import { CancelButton, SubmitButton } from '../components/FormBits';
import IconCircleButton from '../components/IconCircleButton';
import RoomMenuOverlay from '../components/RoomMenuOverlay';
import RoomTabBar, { RoomTabKey } from '../components/RoomTabBar';
import TripHero from '../components/TripHero';
import { useTheme } from '../theme/ThemeContext';
import { PlaceItem } from '../types';
import { RootStackParamList } from '../navigation/types';
import { useGpsNotifications } from '../hooks/useGpsNotifications';
import { useTripDetail } from '../hooks/useTrip';
import { addPlaceItem, deletePlaceLog, fetchPlaceItems, updatePlaceOrder } from '../api/trip';
import RouteMapView from '../components/RouteMapView';
import PlaceLogFormModal, { PlaceLogFormValue } from '../components/PlaceLogFormModal';
import { useToast } from '../components/Toast';
import * as ImagePicker from 'expo-image-picker';
import { fetchTripPhotos, TripPhoto, uploadTripPhoto, } from '../api/tripPhoto';
type Props = NativeStackScreenProps<RootStackParamList, 'RoomMap'>;
export default function RoomMapScreen({ route, navigation }: Props) {
    const [gallery, setGallery] = useState<TripPhoto[]>([]);
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    useGpsNotifications(String(route.params.tripId));
    const { trip, error: tripError, reload: reloadTrip, patchLocal, saveTrip, endTrip, removeTrip } = useTripDetail(route.params.tripId);
    // 조회 전 mock 노출을 막기 위해 빈 배열로 시작. 실패 시에만 mock으로 대체한다.
    const [spots, setSpots] = useState<PlaceItem[]>([]);
    const orderSaving = useRef(false);
    const [placesError, setPlacesError] = useState('');
    const [photosError, setPhotosError] = useState('');
    const [placesLoading, setPlacesLoading] = useState(false);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [mapExpanded, setMapExpanded] = useState(false);
    // 동선 불러오기
    useFocusEffect(useCallback(() => {
        let alive = true;
        setPlacesLoading(true); setPlacesError('');
        const loadPlaces = async () => {
            try {
                const places = await fetchPlaceItems(route.params.tripId);
                if (alive) {
                    setSpots(places);
                }
            }
            catch (error) {
                console.warn('[place] 동선 목록 조회 실패', error);
                if (alive) {
                    setPlacesError(apiError(error, '동선을 불러오지 못했어요'));
                }
            }
        };
        loadPlaces().finally(() => { if (alive) setPlacesLoading(false); });
        return () => {
            alive = false;
        };
    }, [route.params.tripId, reloadKey]));
    useFocusEffect(useCallback(() => {
        let alive = true;
        setPhotosLoading(true); setPhotosError('');
        fetchTripPhotos(route.params.tripId)
            .then((photos) => {
                if (alive)
                    setGallery(photos);
            })
            .catch((error) => {
                console.warn('[trip-photo] 사진 목록 조회 실패', error);
                if (alive)
                    setPhotosError(apiError(error, '사진을 불러오지 못했어요'));
            }).finally(() => { if (alive) setPhotosLoading(false); });
        return () => {
            alive = false;
        };
    }, [route.params.tripId, reloadKey]));
    // 동선 추가
    const handleAddPlace = async (value: PlaceLogFormValue) => {
        try {
            const saved = await addPlaceItem(route.params.tripId, {
                name: value.name,
                memo: value.memo || undefined,
                visitedAt: value.visitedAt || undefined,
                address: value.address,
                latitude: value.latitude,
                longitude: value.longitude,
            });
            setSpots((prev) => [...prev, saved]);
            showToast('📍 동선에 추가됐어요');
        }
        catch (e) {
            console.warn('[place] 동선 추가 실패', e);
            throw e;
        }
    };
    // 동선 삭제 (확인 후 서버 반영)
    const handleDeletePlace = (item: PlaceItem) => {
        const msg = `'${item.name}' 기록을 삭제할까요?`;
        const run = async () => {
            try {
                await deletePlaceLog(route.params.tripId, item.id);
                setSpots((prev) => prev.filter((s) => s.id !== item.id));
                showToast('🗑️ 삭제됐어요');
            }
            catch (e) {
                console.warn('[place] 동선 삭제 실패', e);
                showToast('삭제에 실패했어요');
            }
        };
        if (Platform.OS === 'web') {
            if (window.confirm(msg))
                run();
        }
        else {
            Alert.alert('동선 삭제', msg, [
                { text: '취소', style: 'cancel' },
                { text: '삭제', style: 'destructive', onPress: run },
            ]);
        }
    };
    // 기기 갤러리 사진 추가
    const handlePickTripPhotos = async () => {
        if (uploadingPhotos) return;
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showToast('갤러리 접근 권한이 필요해요');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 5,
        });
        if (result.canceled) {
            return;
        }
        try {
            setUploadingPhotos(true);
            const results = await Promise.allSettled(result.assets.map((asset) => uploadTripPhoto(route.params.tripId, asset)));
            const uploaded = results.flatMap(r => r.status === 'fulfilled' ? [r.value] : []);
            setGallery(previous => [...uploaded, ...previous]);
            const failed = results.length - uploaded.length;
            showToast(failed ? uploaded.length + '장 저장, ' + failed + '장 실패. 실패한 사진만 다시 선택해 주세요.' : '📷 여행 사진이 추가됐어요');
        }
        catch (error) {
            console.warn('[trip-photo] 사진 업로드 실패', error);
            showToast('사진 업로드에 실패했어요');
        } finally { setUploadingPhotos(false); }
    };
    // 동선 공유 (텍스트 요약)
    const handleShare = async () => {
        const lines = spots.map((s, i) => `${i + 1}. ${s.emoji} ${s.name} (${s.timeLabel})`).join('\n');
        try {
            await Share.share({ message: `${trip.name}\n\n${lines}\n\n- 트래블토큰`, title: `${trip.name} 동선` });
        }
        catch (e) {
            console.warn('[place] 공유 실패', e);
        }
    };
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const { showToast } = useToast();
    const [menuOpen, setMenuOpen] = useState(false);
    const onRoomTabChange = (key: RoomTabKey) => {
        if (key === 'expense')
            navigation.replace('RoomExpense', { tripId: trip.id });
        else if (key === 'settle')
            navigation.replace('RoomSettle', { tripId: trip.id });
    };
    const renderSpot = ({ item, getIndex, drag, isActive }: RenderItemParams<PlaceItem>) => {
        const index = getIndex() ?? 0;
        return (<ScaleDecorator>
            <View style={styles.spotRow}>
                <View style={styles.spotLine}>
                    <View style={[styles.spotNum, { backgroundColor: colors.bgChipActive }]}>
                        <Text style={styles.spotNumText}>{index + 1}</Text>
                    </View>
                    {index < spots.length - 1 && <View style={[styles.spotConnector, { backgroundColor: colors.bdCard }]} />}
                </View>
                <View style={[
                    styles.spotCard,
                    { backgroundColor: colors.bgCard, borderColor: colors.bdCard, opacity: isActive ? 0.85 : 1 },
                ]}>
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.spotName, { color: colors.txPrimary }]}>{item.name}</Text>
                        <Text style={[styles.spotMeta, { color: colors.txMuted }]}>
                            {item.timeLabel} · {item.withMembers}
                        </Text>
                    </View>
                    {/* 길게 누른 채로 드래그하면 순서가 바뀝니다 (react-native-draggable-flatlist) */}
                    <Pressable
                        onPress={() => handleDeletePlace(item)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.name} 동선 삭제`}
                        style={[styles.deleteAction, { backgroundColor: colors.bgCard2 }]}
                    >
                        <FontAwesome6 name="trash" size={13} color={colors.txMuted} />
                        <Text style={[styles.deleteActionText, { color: colors.txMuted }]}>삭제</Text>
                    </Pressable>
                    <Pressable onLongPress={drag} disabled={isActive} hitSlop={8} style={styles.dragHandle} accessibilityLabel="방문 순서 변경">
                        <FontAwesome6 name="grip-lines" size={14} color={colors.txMuted} />
                    </Pressable>
                </View>
            </View>
        </ScaleDecorator>);
    };
    return (<View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>
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
        {!!tripError && <Pressable onPress={reloadTrip}><Text style={{ color: colors.danger, padding: 12 }}>{tripError} · 다시 시도</Text></Pressable>}
        <RoomTabBar active="map" onChange={onRoomTabChange} />

        {/* MapView는 네이티브 뷰라서 DraggableFlatList 헤더 안에 두면
              안드로이드에서 렌더링되지 않으므로 리스트 밖에 배치한다. */}
        <RouteMapView spots={spots} height={mapExpanded ? 320 : 150} />
        <View style={styles.mapActions}>
            <Pressable
                onPress={() => setMapExpanded((expanded) => !expanded)}
                style={[styles.mapActionButton, { backgroundColor: colors.bgCard2, borderColor: colors.bdCard }]}
            >
                <FontAwesome6 name={mapExpanded ? 'minimize' : 'expand'} size={12} color={colors.txSecondary} />
                <Text style={[styles.mapActionText, { color: colors.txSecondary }]}>{mapExpanded ? '지도 작게 보기' : '지도 크게 보기'}</Text>
            </Pressable>
            <Pressable
                onPress={() => setAddOpen(true)}
                style={[styles.mapActionButton, styles.primaryMapAction, { backgroundColor: colors.bgChipActive }]}
            >
                <FontAwesome6 name="plus" size={12} color="#FFFFFF" />
                <Text style={[styles.mapActionText, { color: '#FFFFFF' }]}>장소 추가</Text>
            </Pressable>
        </View>
        {(placesError || photosError) ? <Pressable onPress={() => setReloadKey(k => k + 1)}><Text style={{ color: colors.danger, padding: 12 }}>{placesError || photosError} · 눌러서 다시 시도</Text></Pressable> : null}
        {(placesLoading || photosLoading) && <Text style={{ color: colors.txMuted, paddingHorizontal: 20 }}>여행 기록 불러오는 중…</Text>}

        {/* 원본의 SVG 동선지도는 좌표 기반 캔버스 렌더링이라 RN에서는
              드래그로 순서를 바꿀 수 있는 리스트로 대체 구현했습니다. */}
        <DraggableFlatList data={spots} keyExtractor={(item) => item.id} onDragEnd={async ({ data }) => {
            if (orderSaving.current)
                return;
            orderSaving.current = true;
            const previous = spots;
            setSpots(data);
            try {
                await updatePlaceOrder(route.params.tripId, data.map((item) => item.id));
            }
            catch {
                setSpots(previous);
                showToast('방문 순서를 저장하지 못했어요. 다시 시도해 주세요.');
            }
            finally {
                orderSaving.current = false;
            }
        }} renderItem={renderSpot} ListEmptyComponent={!placesLoading && !placesError ? <Text style={{ color: colors.txMuted, padding: 20 }}>아직 추가한 동선이 없어요.</Text> : null} ListHeaderComponent={<View>
            <View style={styles.routeHd}>
                <Text style={[styles.sectionTitle, { color: colors.txPrimary }]}>방문 순서</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome6 name="arrows-up-down" size={10} color={colors.txMuted} />
                    <Text style={{ fontSize: 11, color: colors.txMuted, marginLeft: 4 }}>꾹 눌러서 순서를 바꿀 수 있어요</Text>
                </View>
            </View>
        </View>} ListFooterComponent={<View>
            <View style={styles.galleryHd}>
                <Text style={[styles.sectionTitle, { color: colors.txPrimary }]}>갤러리</Text>
                <Pressable onPress={() => setGalleryOpen(true)}>
                    <Text style={{ fontSize: 12, color: colors.txMuted }}>전체보기</Text>
                </Pressable>
            </View>
            <View style={styles.galleryRow}>
                {gallery.slice(0, 3).map((photo) => (<ApiImage key={photo.id} uri={"/api/trips/" + route.params.tripId + "/photos/" + photo.id + "/content"} style={styles.galleryImage} />))}
            </View>
            <Pressable onPress={handleShare} style={[styles.shareBtn, { backgroundColor: colors.bgCard2, borderColor: colors.bdCard }]}>
                <FontAwesome6 name="share-nodes" size={13} color={colors.txSecondary} />
                <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: '600', color: colors.txSecondary }}>
                    동선 지도 공유하기
                </Text>
            </Pressable>
        </View>} containerStyle={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} />

        <PlaceLogFormModal visible={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAddPlace} />

        <BottomSheetModal visible={galleryOpen} onClose={() => setGalleryOpen(false)} title="갤러리 전체">
            <View style={styles.galleryGrid}>
                {gallery.map((photo) => (<ApiImage key={photo.id} uri={"/api/trips/" + route.params.tripId + "/photos/" + photo.id + "/content"} style={styles.galleryGridImage} />))}
            </View>
            <SubmitButton label={uploadingPhotos ? "사진 업로드 중…" : "사진 추가하기"} disabled={uploadingPhotos} onPress={handlePickTripPhotos} />
            <CancelButton label="닫기" onPress={() => setGalleryOpen(false)} />
        </BottomSheetModal>

        <RoomMenuOverlay menuOpen={menuOpen} onCloseMenu={() => setMenuOpen(false)} emoji={trip.emoji} name={trip.name} dateLabel={trip.dateLabel} tripId={trip.id} onSaveTripInfo={async (e, n) => { await saveTrip({ name: n, emoji: e }); }} onEndTrip={endTrip} onDeleteTrip={removeTrip} onDeleted={() => navigation.goBack()} />
    </View>);
}
function toImageUrl(imageUrl: string): string {
    if (/^https?:\/\//.test(imageUrl))
        return imageUrl;
    return `http://192.168.123.4:8080${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
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
    deleteAction: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6 },
    deleteActionText: { fontSize: 11, fontWeight: '600' },
    mapActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
    mapActionButton: { flex: 1, minHeight: 40, borderRadius: 12, borderWidth: 0.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
    primaryMapAction: { borderWidth: 0 },
    mapActionText: { fontSize: 12, fontWeight: '700' },
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
    galleryImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    galleryGridImage: {
        width: '31%',
        height: 80,
        borderRadius: 12,
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
