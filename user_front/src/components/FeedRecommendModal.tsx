import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';
import {
    RecoItem,
    fetchTripRecommendations,
    updateRecommendationStatus,
} from '../api/recommendation';

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
    const [items, setItems] = useState<RecoItem[]>([]);
    const [checked, setChecked] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!visible || !tripId) return;

        (async () => {
            setLoading(true);
            try {
                const list = await fetchTripRecommendations(tripId);
                const pending = list.filter((r) => r.status === 'pending');
                setItems(pending);
                setChecked(pending.map((r) => r.id));
            } catch (e) {
                console.warn('[reco] 목록 조회 실패', e);
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [visible, tripId]);

    const toggle = (id: string) =>
        setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await Promise.all(checked.map((id) => updateRecommendationStatus(id, 'adopted')));
            onCreateFeeds(checked);
        } catch (e) {
            console.warn('[reco] 채택 처리 실패', e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <BottomSheetModal visible={visible} onClose={onClose} title="✨ AI 추천 피드">
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator />
                    <Text style={[styles.hint, { color: colors.txMuted }]}>추천을 불러오는 중...</Text>
                </View>
            ) : items.length === 0 ? (
                <View style={styles.center}>
                    <Text style={[styles.hint, { color: colors.txMuted }]}>
                        아직 추천이 없어요. 정산을 완료하면 AI가 글을 준비해 드려요.
                    </Text>
                </View>
            ) : (
                <View style={{ gap: 8 }}>
                    {items.map((item) => {
                        const on = checked.includes(item.id);
                        return (
                            <Pressable
                                key={item.id}
                                onPress={() => toggle(item.id)}
                                style={[styles.row, { borderColor: on ? colors.bgChipActive : colors.bdCard }]}
                            >
                                <Text style={[styles.check, { color: on ? colors.bgChipActive : colors.txMuted }]}>
                                    {on ? '☑' : '☐'}
                                </Text>
                                <Text style={[styles.caption, { color: colors.txPrimary }]} numberOfLines={3}>
                                    {item.caption}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}

            <View style={styles.actions}>
                <CancelButton onPress={onClose} label="닫기" />
                <SubmitButton
                    onPress={handleSubmit}
                    label={submitting ? '처리 중...' : `피드 ${checked.length}개 만들기`}
                />
            </View>
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    center: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    hint: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
    row: { flexDirection: 'row', gap: 10, padding: 12, borderWidth: 1, borderRadius: 12 },
    check: { fontSize: 16 },
    caption: { flex: 1, fontSize: 13, lineHeight: 19 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
});
