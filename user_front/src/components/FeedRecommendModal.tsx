import { TextInput } from 'react-native';
import { searchPlaces, PlaceSearchItem } from '../api/place';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, SubmitButton } from './FormBits';
import { useToast } from './Toast';
import { apiError } from '../utils/apiError';
import { useTheme } from '../theme/ThemeContext';
import { RecoItem, fetchTripRecommendations, adoptRecommendation, } from '../api/recommendation';
interface Props {
    visible: boolean;
    onClose: () => void;
    onCreateFeeds: (ids: string[]) => void;
    /** 추천을 조회할 여행 id. 미전달 시 목록 조회를 건너뛴다 */
    tripId?: string;
}
/**
 * AI 추천 피드 모달.
 * 미처리(pending) 추천만 노출하고, 선택 항목을 adopted로 일괄 반영한다.
 */
export default function FeedRecommendModal({ visible, onClose, onCreateFeeds, tripId }: Props) {
    const { colors } = useTheme();
    const { showToast } = useToast();
    const [placeQuery, setPlaceQuery] = useState('');
    const [placeResults, setPlaceResults] = useState<PlaceSearchItem[]>([]);
    const [fallbackPlace, setFallbackPlace] = useState<number | undefined>();
    const [items, setItems] = useState<RecoItem[]>([]);
    const [checked, setChecked] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        if (!visible || !tripId)
            return;
        (async () => {
            setLoading(true);
            try {
                const list = await fetchTripRecommendations(tripId);
                const pending = list.filter((r) => r.status === 'pending');
                setItems(pending);
                setChecked(pending.map((r) => r.id));
            }
            catch (e) {
                console.warn('[reco] 목록 조회 실패', e);
                setItems([]);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [visible, tripId]);
    const toggle = (id: string) => setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    const handleSubmit = async () => {
        if (submitting)
            return;
        setSubmitting(true);
        try {
            const results = await Promise.allSettled(checked.map(id => { const item = items.find(i => i.id === id)!; return adoptRecommendation(id, item.caption, item.placeId ?? fallbackPlace); }));
            const done = checked.filter((_, i) => results[i].status === 'fulfilled');
            setItems(prev => prev.filter(i => !done.includes(i.id)));
            setChecked(prev => prev.filter(id => !done.includes(id)));
            if (done.length)
                onCreateFeeds(done);
            const failure = results.find(r => r.status === 'rejected');
            if (failure?.status === 'rejected')
                showToast(apiError(failure.reason));
        }
        catch (e) {
            console.warn('[reco] 채택 처리 실패', e);
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<BottomSheetModal visible={visible} onClose={onClose} title="✨ 여행 피드 초안">
            {items.some(i => i.placeId == null) && <View><Text style={{ color: colors.txMuted }}>장소가 없는 초안은 장소를 먼저 선택해 주세요.</Text><TextInput value={placeQuery} onChangeText={async (text) => {
                setPlaceQuery(text);
                setFallbackPlace(undefined);
                try {
                    setPlaceResults(text.trim().length >= 2 ? await searchPlaces(text) : []);
                }
                catch (e) {
                    showToast(apiError(e));
                }
            }} placeholder="장소 검색" style={{ color: colors.txPrimary, padding: 12 }}/>{placeResults.map(p => <Pressable key={p.id} onPress={() => { setFallbackPlace(p.id); setPlaceQuery(p.name); setPlaceResults([]); }}><Text style={{ padding: 8, color: colors.txPrimary }}>{p.name}</Text></Pressable>)}</View>}
            {loading ? (<View style={styles.center}>
                    <ActivityIndicator />
                    <Text style={[styles.hint, { color: colors.txMuted }]}>추천을 불러오는 중...</Text>
                </View>) : items.length === 0 ? (<View style={styles.center}>
                    <Text style={[styles.hint, { color: colors.txMuted }]}>
                        아직 추천이 없어요. 정산을 완료하면 여행 기록으로 글을 준비해 드려요.
                    </Text>
                </View>) : (<View style={{ gap: 8 }}>
                    {items.map((item) => {
                const on = checked.includes(item.id);
                return (<Pressable key={item.id} onPress={() => toggle(item.id)} style={[styles.row, { borderColor: on ? colors.bgChipActive : colors.bdCard }]}>
                                <Text style={[styles.check, { color: on ? colors.bgChipActive : colors.txMuted }]}>
                                    {on ? '☑' : '☐'}
                                </Text>
                                <TextInput multiline style={[styles.caption, { color: colors.txPrimary }]} value={item.caption} onChangeText={caption => setItems(prev => prev.map(i => i.id === item.id ? { ...i, caption } : i))} maxLength={2000}/>
                            </Pressable>);
            })}
                </View>)}

            <View style={styles.actions}>
                <CancelButton onPress={onClose} label="닫기"/>
                <SubmitButton disabled={submitting || !checked.length} onPress={handleSubmit} label={submitting ? '처리 중...' : `피드 ${checked.length}개 만들기`}/>
            </View>
        </BottomSheetModal>);
}
const styles = StyleSheet.create({
    center: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    hint: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
    row: { flexDirection: 'row', gap: 10, padding: 12, borderWidth: 1, borderRadius: 12 },
    check: { fontSize: 16 },
    caption: { flex: 1, fontSize: 13, lineHeight: 19 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
});
