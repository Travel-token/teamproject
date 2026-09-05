import { useRef } from 'react';
import * as Location from 'expo-location';
import { api } from '../api/client';
import { useToast } from './Toast';
import { apiError } from '../utils/apiError';
import React, { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, FormInput, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';
import { searchPlaces, PlaceSearchItem } from '../api/place';
export interface PlaceLogFormValue {
    name: string;
    memo: string;
    visitedAt: string; // "yyyy-MM-dd HH:mm"
    placeId?: number;
}
// TODO: placeId는 TourAPI 장소 검색 연동 시 선택 결과로 자동 입력되도록 교체
export default function PlaceLogFormModal({ visible, onClose, onSubmit, }: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (value: PlaceLogFormValue) => Promise<void>;
}) {
    const { colors } = useTheme();
    const { showToast } = useToast();
    const seq = useRef(0);
    const nearby = async () => {
        try {
            const p = await Location.getForegroundPermissionsAsync();
            if (p.status !== 'granted') {
                showToast('위치 권한이 필요해요');
                return;
            }
            const pos = await Location.getCurrentPositionAsync({});
            setResults((await api.get<PlaceSearchItem[]>('/api/places/nearby', { params: { lat: pos.coords.latitude, lng: pos.coords.longitude } })).data);
        }
        catch (e) {
            showToast(apiError(e));
        }
    };
    const [name, setName] = useState('');
    const [memo, setMemo] = useState('');
    const [visitedAt, setVisitedAt] = useState('');
    const [placeId, setPlaceId] = useState('');
    const [results, setResults] = useState<PlaceSearchItem[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<PlaceSearchItem | null>(null);
    useEffect(() => {
        if (!visible)
            return;
        seq.current++;
        setResults([]);
        setSelectedPlace(null);
        setName('');
        setMemo('');
        setPlaceId('');
        setVisitedAt(nowText());
    }, [visible]);
    const onChangeName = async (text: string) => {
        setName(text);
        setSelectedPlace(null);
        setPlaceId('');
        const n = ++seq.current;
        if (text.trim().length < 2) {
            setResults([]);
            return;
        }
        try {
            const items = await searchPlaces(text.trim());
            if (seq.current === n)
                setResults(items);
        }
        catch (e) {
            showToast(apiError(e));
        }
    };
    const [saving, setSaving] = useState(false);
    const submit = async () => {
        if (!name.trim() || saving)
            return;
        setSaving(true);
        try {
            await onSubmit({
                name: name.trim(),
                memo: memo.trim(),
                visitedAt: visitedAt.trim() || nowText(),
                placeId: selectedPlace?.id
                    ?? (placeId.trim() ? Number(placeId) : undefined),
            });
            onClose();
        }
        catch (e) {
            showToast(apiError(e));
        }
        finally {
            setSaving(false);
        }
    };
    return (<BottomSheetModal visible={visible} onClose={onClose} title="장소 추가">
            <Text style={{ fontSize: 12, color: colors.txMuted, marginBottom: 10 }}>
                검색 결과를 선택하면 지도에 위치가 표시됩니다.
            </Text>
            <FormInput placeholder="장소명 (필수)" value={name} onChangeText={onChangeName} maxLength={100}/>

            <SubmitButton label="내 주변 장소" onPress={nearby}/>
            {results.map((place) => (<Pressable key={place.id} onPress={() => {
                seq.current++;
                setSelectedPlace(place);
                setName(place.name);
                setPlaceId(String(place.id));
                setResults([]);
            }} style={{
                paddingVertical: 10,
                borderBottomWidth: 0.5,
                borderColor: colors.bdCard,
            }}>
                    <Text style={{ color: colors.txPrimary }}>
                        {place.name}
                    </Text>
                    {!!place.address && (<Text style={{ fontSize: 12, color: colors.txMuted }}>
                            {place.address}
                        </Text>)}
                </Pressable>))}

            <FormInput placeholder="메모" value={memo} onChangeText={setMemo}/>
            <FormInput placeholder="방문 시각 (2026-04-10 14:50)" value={visitedAt} onChangeText={setVisitedAt} maxLength={16}/>
            <FormInput placeholder="장소 ID (선택, 숫자)" value={placeId} onChangeText={(t) => setPlaceId(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad"/>

            <SubmitButton label="동선에 추가" onPress={submit} disabled={saving || !name.trim()}/>
            <CancelButton onPress={onClose}/>
        </BottomSheetModal>);
}
// "2026-04-10 14:50" 형태의 현재 시각
function nowText(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
