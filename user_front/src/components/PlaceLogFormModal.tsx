import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import * as Location from 'expo-location';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, FormInput, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';
import { useToast } from './Toast';
import { apiError } from '../utils/apiError';

export interface PlaceLogFormValue {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    memo: string;
    visitedAt: string;
}

// 사용자가 입력한 목적지 주소만 Android에서 좌표로 바꾼다.
// 현재 기기의 GPS 좌표는 이 흐름에서 읽거나 서버로 보내지 않는다.
export default function PlaceLogFormModal({ visible, onClose, onSubmit }: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (value: PlaceLogFormValue) => Promise<void>;
}) {
    const { colors } = useTheme();
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [coordinate, setCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
    const [memo, setMemo] = useState('');
    const [visitedAt, setVisitedAt] = useState('');
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setName(''); setAddress(''); setCoordinate(null); setMemo('');
        setVisitedAt(nowText()); setSearching(false); setSaving(false);
    }, [visible]);

    const findAddress = async () => {
        if (address.trim().length < 2 || searching) {
            if (!searching) showToast('주소를 입력해 주세요');
            return;
        }
        setSearching(true);
        try {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== 'granted') {
                showToast('Android 주소 검색 권한이 필요해요');
                return;
            }
            const found = await Location.geocodeAsync(address.trim());
            const first = found.find(item => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
            if (!first) {
                setCoordinate(null);
                showToast('주소를 찾지 못했어요. 도로명과 건물번호를 확인해 주세요.');
                return;
            }
            setCoordinate({ latitude: first.latitude, longitude: first.longitude });
            showToast('지도에 표시할 주소를 찾았어요');
        } catch (error) {
            setCoordinate(null);
            showToast(apiError(error, '주소 검색에 실패했어요'));
        } finally { setSearching(false); }
    };

    const submit = async () => {
        if (!name.trim() || !coordinate || saving) return;
        setSaving(true);
        try {
            await onSubmit({ name: name.trim(), address: address.trim(), latitude: coordinate.latitude,
                longitude: coordinate.longitude, memo: memo.trim(), visitedAt: visitedAt.trim() || nowText() });
            onClose();
        } catch (error) { showToast(apiError(error)); }
        finally { setSaving(false); }
    };

    return <BottomSheetModal visible={visible} onClose={onClose} title="장소 추가">
        <Text style={{ fontSize: 12, color: colors.txMuted, marginBottom: 10 }}>
            목적지 주소를 검색하면 지도에 지점이 표시됩니다. 현재 위치는 서버로 전송하지 않습니다.
        </Text>
        <FormInput placeholder="장소명 (필수)" value={name} onChangeText={setName} maxLength={100}/>
        <FormInput placeholder="도로명 주소 (필수)" value={address} onChangeText={(text) => { setAddress(text); setCoordinate(null); }} maxLength={200}/>
        <SubmitButton label={searching ? '주소 찾는 중…' : '주소 검색'} onPress={findAddress} disabled={searching}/>
        {!!coordinate && <Text style={{ color: colors.txSecondary, fontSize: 12, marginVertical: 8 }}>✓ 주소 확인 완료 · 지도 좌표가 준비됐어요</Text>}
        <FormInput placeholder="메모" value={memo} onChangeText={setMemo}/>
        <FormInput placeholder="방문 시각 (2026-04-10 14:50)" value={visitedAt} onChangeText={setVisitedAt} maxLength={16}/>
        <SubmitButton label="동선에 추가" onPress={submit} disabled={saving || !name.trim() || !coordinate}/>
        <CancelButton onPress={onClose}/>
    </BottomSheetModal>;
}

function nowText(): string {
    const d = new Date(); const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
