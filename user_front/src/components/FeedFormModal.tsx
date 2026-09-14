import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, Pressable, View } from 'react-native';
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
    placeId: number | null;
    place?: PlaceSearchItem;
    caption: string;
    photoUrl: string;
}
export default function FeedFormModal({ visible, onClose, mode, initialValue, onSubmit, inline = false }: {
    visible: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    initialValue?: FeedFormValue;
    onSubmit: (v: FeedFormValue) => boolean | void | Promise<boolean | void>;
    inline?: boolean;
}) {
    const { colors } = useTheme(), { showToast } = useToast();
    const [query, setQuery] = useState(''), [placeId, setPlaceId] = useState<number | null>(null), [selectedPlace, setSelectedPlace] = useState<PlaceSearchItem | undefined>(), [results, setResults] = useState<PlaceSearchItem[]>([]), [searching, setSearching] = useState(false), [searchError, setSearchError] = useState(''), [caption, setCaption] = useState(''), [photoUrl, setPhotoUrl] = useState(''), [previewUri, setPreviewUri] = useState(''), [busy, setBusy] = useState(false);
    const seq = useRef(0);
    const searchRequest = useRef<AbortController | null>(null);
    useEffect(() => () => { seq.current++; searchRequest.current?.abort(); }, [visible]);
    useEffect(() => {
        if (visible) {
            setPlaceId(initialValue?.placeId ?? null);
            setSelectedPlace(initialValue?.place);
            setCaption(initialValue?.caption ?? '');
            setPhotoUrl(initialValue?.photoUrl ?? '');
            setPreviewUri('');
            setQuery('');
            setResults([]);
            setSearching(false);
            setSearchError('');
            seq.current++;
        }
    }, [visible]);
    const search = async (text: string) => {
        setQuery(text);
        setPlaceId(null);
        setSelectedPlace(undefined);
        searchRequest.current?.abort();
        const n = ++seq.current;
        if (text.trim().length < 2) {
            setResults([]);
            setSearching(false);
            setSearchError('');
            return;
        }
        setSearching(true);
        setSearchError('');
        setResults([]);
        await new Promise(resolve => setTimeout(resolve, 350));
        if (seq.current !== n) return;
        const controller = new AbortController();
        searchRequest.current = controller;
        try {
            const found = await searchPlaces(text.trim(), controller.signal);
            if (seq.current === n) {
                setResults(found);
                setSearchError(found.length ? '' : '검색 결과가 없어요. 다른 이름으로 검색해 주세요.');
            }
        }
        catch (e) {
            if (seq.current === n && !controller.signal.aborted) setSearchError(apiError(e, '장소 검색에 실패했어요.'));
        }
        finally {
            if (seq.current === n) setSearching(false);
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
            if (!r.canceled) {
                const asset = r.assets[0];
                const uploadedUrl = await uploadFeedPhoto(asset);
                setPhotoUrl(uploadedUrl);
                // 업로드 직후에는 인증 헤더가 필요한 원격 주소를 다시 읽지 않고
                // 방금 선택한 기기 파일을 보여준다. 저장 값은 서버 URL을 유지한다.
                setPreviewUri(asset.uri);
            }
        }
        catch (e) {
            showToast(apiError(e));
        }
        finally {
            setBusy(false);
        }
    };
    const form = <View>
        {mode === 'create' && <View>
            <Text style={{ color: colors.txMuted, fontSize: 12, marginBottom: 8 }}>
                한국관광공사 등록 여행지를 반드시 선택해 주세요.
            </Text>
            <FormInput value={query} onChangeText={search} placeholder="관광공사 여행지 검색" />
            {searching && <ActivityIndicator style={{ marginVertical: 10 }} />}
            {!!searchError && <Text style={{ color: colors.danger, paddingVertical: 8 }}>{searchError}</Text>}
            {results.length > 0 && <View style={{ maxHeight: 240 }}>
                {results.map(p => <Pressable
                    key={p.externalApiId ?? String(p.id)}
                    onPress={() => {
                        seq.current++;
                        setPlaceId(p.id);
                        setSelectedPlace(p);
                        setQuery(p.name);
                        setResults([]);
                        setSearching(false);
                        setSearchError('');
                    }}
                    style={{ padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.bdCard }}
                >
                    <Text style={{ color: colors.txPrimary, fontWeight: '600' }}>{p.name}</Text>
                    <Text style={{ color: colors.txMuted }}>{p.address || '주소 정보 없음'}</Text>
                </Pressable>)}
            </View>}
        </View>}
        {!!photoUrl && (previewUri
            ? <Image source={{ uri: previewUri }} resizeMode="cover" style={{ width: '100%', height: 160, marginVertical: 12 }} />
            : <ApiImage uri={photoUrl} style={{ width: '100%', height: 160, marginVertical: 12 }} />)}
        <SubmitButton label="사진 선택" disabled={busy} onPress={upload} />
        {!!photoUrl && <CancelButton label="사진 제거" onPress={() => { setPhotoUrl(''); setPreviewUri(''); }} />}
        <FormInput value={caption} onChangeText={setCaption} placeholder="여행 이야기를 남겨보세요" multiline maxLength={2000} style={{ minHeight: 100, marginVertical: 12 }} />
        <SubmitButton label="저장" disabled={busy} onPress={async () => {
            if (busy)
                return;
            if (mode === 'create' && !placeId && !selectedPlace?.externalApiId) {
                showToast('검색 결과에서 장소를 선택해 주세요.');
                return;
            }
            if (!caption.trim()) {
                showToast('피드 내용을 입력해 주세요.');
                return;
            }
            setBusy(true);
            try {
                const submitted = await onSubmit({ placeId, place: selectedPlace, caption: caption.trim(), photoUrl });
                // 서버 저장에 실패하면 작성 내용과 모달을 그대로 유지한다.
                if (submitted !== false) onClose();
            }
            catch (e) {
                showToast(apiError(e));
            }
            finally {
                setBusy(false);
            }
        }} />
        <CancelButton onPress={onClose} />
    </View>;
    if (inline) {
        return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>{form}</ScrollView>;
    }
    return <BottomSheetModal visible={visible} onClose={onClose} title={mode === 'create' ? '피드 작성' : '피드 수정'}>{form}</BottomSheetModal>;
}
