import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, FormInput, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';

export interface PlaceLogFormValue {
    name: string;
    memo: string;
    visitedAt: string;   // "yyyy-MM-dd HH:mm"
    placeId?: number;
}

// TODO: placeId는 TourAPI 장소 검색 연동 시 선택 결과로 자동 입력되도록 교체
export default function PlaceLogFormModal({
                                              visible,
                                              onClose,
                                              onSubmit,
                                          }: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (value: PlaceLogFormValue) => void;
}) {
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [memo, setMemo] = useState('');
    const [visitedAt, setVisitedAt] = useState('');
    const [placeId, setPlaceId] = useState('');

    useEffect(() => {
        if (!visible) return;
        setName('');
        setMemo('');
        setPlaceId('');
        setVisitedAt(nowText());
    }, [visible]);

    const submit = () => {
        if (!name.trim()) return;
        onSubmit({
            name: name.trim(),
            memo: memo.trim(),
            visitedAt: visitedAt.trim() || nowText(),
            placeId: placeId.trim() ? Number(placeId) : undefined,
        });
        onClose();
    };

    return (
        <BottomSheetModal visible={visible} onClose={onClose} title="장소 추가">
            <Text style={{ fontSize: 12, color: colors.txMuted, marginBottom: 10 }}>
                장소 ID를 입력하면 지도에 좌표가 표시됩니다.
            </Text>

            <FormInput placeholder="장소명 (필수)" value={name} onChangeText={setName} maxLength={100} />
            <FormInput placeholder="메모" value={memo} onChangeText={setMemo} maxLength={200} />
            <FormInput
                placeholder="방문 시각 (2026-04-10 14:50)"
                value={visitedAt}
                onChangeText={setVisitedAt}
                maxLength={16}
            />
            <FormInput
                placeholder="장소 ID (선택, 숫자)"
                value={placeId}
                onChangeText={(t) => setPlaceId(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
            />

            <SubmitButton label="동선에 추가" onPress={submit} disabled={!name.trim()} />
            <CancelButton onPress={onClose} />
        </BottomSheetModal>
    );
}

// "2026-04-10 14:50" 형태의 현재 시각
function nowText(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
