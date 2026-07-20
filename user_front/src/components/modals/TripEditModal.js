import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import FormField from '../common/FormField';
import AppButton from '../common/AppButton';
import { colors, fontSize, spacing } from '../../constants/theme';
import { useTrip } from '../../context/TripContext';
import { useToast } from '../../context/ToastContext';
import { updateTrip } from '../../api/tripApi';

// ============================================================
// TripEditModal : 여행 정보 수정 모달 (h-1)
// 열릴 때 현재 여행 정보를 입력칸에 미리 채우고,
// 저장 시 PATCH /api/trips/{id} 를 호출한 뒤 화면 상태를 갱신합니다.
// ============================================================
export default function TripEditModal({ visible, onClose, trip }) {
    const { setActiveTrip } = useTrip();
    const toast = useToast();

    const [name, setName] = useState('');
    const [region, setRegion] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [saving, setSaving] = useState(false); // 저장 중 중복 클릭 방지

    // 모달이 열릴 때마다 현재 여행 값으로 입력칸을 미리 채움
    // (useEffect = "visible이나 trip이 바뀌면 이 코드를 실행해줘")
    useEffect(() => {
        if (visible && trip) {
            setName(trip.name || '');
            setRegion(trip.region || '');
            setStartDate(trip.startDate || '');
            setEndDate(trip.endDate || '');
            setBudget(String(trip.budget || 0));
        }
    }, [visible, trip]);

    const isDate = (t) => /^\d{4}-\d{2}-\d{2}$/.test(t);

    const handleSave = async () => {
        if (saving) return; // 이미 저장 중이면 무시
        // 문지기 (서버에도 있지만 프론트에서 먼저 친절하게)
        if (!name.trim()) { toast.show('여행 이름을 입력해주세요'); return; }
        if (!region.trim()) { toast.show('여행 지역을 입력해주세요'); return; }
        if (!isDate(startDate) || !isDate(endDate)) { toast.show('날짜는 2026-08-01 형식으로 입력해주세요'); return; }
        if (startDate > endDate) { toast.show('종료일이 시작일보다 빠를 수 없어요'); return; }

        setSaving(true);
        try {
            // 서버에 수정 요청 → 서버가 "수정된 최신 모습"을 답장으로 줌
            const saved = await updateTrip(trip.id, {
                name: name.trim(),
                emoji: trip.emoji,
                region: region.trim(),
                startDate,
                endDate,
                budget: Number(budget) || 0,
                currency: trip.currency || 'KRW',
            });

            // 화면 상태 갱신: 기존 trip을 복사(...)하고 바뀐 값만 덮어쓰기
            const nights = Math.round(
                (new Date(saved.endDate) - new Date(saved.startDate)) / (1000 * 60 * 60 * 24)
            );
            setActiveTrip({
                ...trip,
                name: saved.name,
                region: saved.region,
                startDate: saved.startDate,
                endDate: saved.endDate,
                budget: saved.budget,
                nights,
            });

            toast.show('여행 정보가 수정되었습니다 ✅');
            onClose();
        } catch (e) {
            console.warn('[trip] 수정 실패:', e?.message);
            toast.show('서버 저장에 실패했어요 ⚠️');
        } finally {
            setSaving(false); // 성공하든 실패하든 잠금 해제
        }
    };

    return (
        <BottomSheetModal visible={visible} onClose={onClose}>
            <Text style={styles.title}>여행 정보 수정</Text>
            <Text style={styles.subtitle}>{trip?.emoji} {trip?.name}</Text>

            <FormField label="여행 이름" required value={name} onChangeText={setName} maxLength={20} />
            <FormField label="여행 지역" required value={region} onChangeText={setRegion} />
            <FormField label="시작일" required value={startDate} onChangeText={setStartDate}
                       placeholder="2026-08-01" maxLength={10} />
            <FormField label="종료일" required value={endDate} onChangeText={setEndDate}
                       placeholder="2026-08-03" maxLength={10} />
            <FormField label="총 예산 (원)" value={budget}
                       onChangeText={(t) => setBudget(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />

            <View style={styles.buttons}>
                <AppButton title={saving ? '저장 중...' : '저장하기'} onPress={handleSave} />
                <AppButton title="취소" variant="secondary" onPress={onClose} />
            </View>
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: fontSize.title, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
    subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
    buttons: { gap: spacing.sm, marginTop: spacing.md },
});