import React, { useState, useEffect, useRef } from 'react';
import { Text, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadFeedPhoto } from '../api/feedPhoto';
import { searchPlaces, PlaceSearchItem } from '../api/place';
import { apiError } from '../utils/apiError';
import { useToast } from './Toast';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, FormInput, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';
import ApiImage from './ApiImage';
export interface FeedFormValue {
    placeId: number;
    caption: string;
    photoUrl: string;
}
export default function FeedFormModal({ visible, onClose, mode, initialValue, onSubmit }: {
    visible: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    initialValue?: FeedFormValue;
    onSubmit: (v: FeedFormValue) => void | Promise<void>;
}) {
    const { colors } = useTheme(), { showToast } = useToast();
    const [query, setQuery] = useState(''), [placeId, setPlaceId] = useState<number | null>(null), [results, setResults] = useState<PlaceSearchItem[]>([]), [caption, setCaption] = useState(''), [photoUrl, setPhotoUrl] = useState(''), [busy, setBusy] = useState(false);
    const seq = useRef(0);
    useEffect(() => {
        if (visible) {
            setPlaceId(initialValue?.placeId ?? null);
            setCaption(initialValue?.caption ?? '');
            setPhotoUrl(initialValue?.photoUrl ?? '');
            setQuery('');
            setResults([]);
            seq.current++;
        }
    }, [visible]);
    const search = async (text: string) => {
        setQuery(text);
        setPlaceId(null);
        const n = ++seq.current;
        if (text.trim().length < 2) {
            setResults([]);
            return;
        }
        try {
            const found = await searchPlaces(text.trim());
            if (seq.current === n)
                setResults(found);
        }
        catch (e) {
            showToast(apiError(e));
        }
    };
    const upload = async () => {
        if (busy)
            return;
        setBusy(true);
        try {
            const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!p.granted) {
                showToast('사진 접근 권한이 필요해요');
                return;
            }
            const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
            if (!r.canceled)
                setPhotoUrl(await uploadFeedPhoto(r.assets[0]));
        }
        catch (e) {
            showToast(apiError(e));
        }
        finally {
            setBusy(false);
        }
    };
    return <BottomSheetModal visible={visible} onClose={onClose} title={mode === 'create' ? '피드 작성' : '피드 수정'}>
  {mode === 'create' && <><FormInput value={query} onChangeText={search} placeholder="장소 이름으로 검색"/>{results.map(p => <Pressable key={p.id} onPress={() => { seq.current++; setPlaceId(p.id); setQuery(p.name); setResults([]); }} style={{ padding: 12 }}><Text style={{ color: colors.txPrimary }}>{p.name}</Text><Text style={{ color: colors.txMuted }}>{p.address}</Text></Pressable>)}</>}
  {!!photoUrl && <ApiImage uri={photoUrl} style={{ width: '100%', height: 160, marginVertical: 12 }}/>}
  <SubmitButton label="사진 선택" disabled={busy} onPress={upload}/>
  {!!photoUrl && <CancelButton label="사진 제거" onPress={() => setPhotoUrl('')}/>}
  <FormInput value={caption} onChangeText={setCaption} placeholder="여행 이야기를 남겨보세요" multiline maxLength={2000} style={{ minHeight: 100, marginVertical: 12 }}/>
  <SubmitButton label="저장" disabled={busy || !placeId || !caption.trim()} onPress={async () => {
            if (busy || !placeId)
                return;
            setBusy(true);
            try {
                await onSubmit({ placeId, caption: caption.trim(), photoUrl });
                onClose();
            }
            catch (e) {
                showToast(apiError(e));
            }
            finally {
                setBusy(false);
            }
        }}/><CancelButton onPress={onClose}/>
 </BottomSheetModal>;
}
