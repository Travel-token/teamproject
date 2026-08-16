import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, FormInput, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';

// TODO: 지금은 장소를 숫자 ID로 직접 입력받는 임시 폼입니다.
// 한국관광공사 TourAPI 연동 장소 검색이 붙으면 placeId는 검색 결과 선택으로 자동 채워지도록 교체하세요.
// 사진도 URL 직접 입력 대신 실제 업로드(이미지 선택 + 스토리지 업로드) API로 교체가 필요합니다.
export interface FeedFormValue {
  placeId: number;
  caption: string;
  photoUrl: string;
}

export default function FeedFormModal({
  visible,
  onClose,
  mode,
  initialValue,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialValue?: FeedFormValue;
  onSubmit: (value: FeedFormValue) => void;
}) {
  const { colors } = useTheme();
  const [placeId, setPlaceId] = useState('');
  const [caption, setCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (visible) {
      setPlaceId(initialValue?.placeId ? String(initialValue.placeId) : '');
      setCaption(initialValue?.caption ?? '');
      setPhotoUrl(initialValue?.photoUrl ?? '');
    }
  }, [visible, initialValue]);

  const placeIdNumber = Number(placeId);
  const canSubmit = mode === 'edit' || (placeId.trim().length > 0 && !Number.isNaN(placeIdNumber));

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title={mode === 'create' ? '피드 작성' : '피드 수정'} maxHeightPct={90}>
      {mode === 'create' && (
        <>
          <Text style={{ fontSize: 11, fontWeight: '700', marginTop: 16, marginBottom: 8, color: colors.txMuted }}>
            장소 ID (임시)
          </Text>
          <FormInput
            value={placeId}
            onChangeText={setPlaceId}
            placeholder="예: 1"
            keyboardType="number-pad"
            style={{ marginBottom: 4 }}
          />
          <Text style={{ fontSize: 10, marginBottom: 8, color: colors.txPlaceholder }}>
            (데모: 실제 서비스에서는 한국관광공사 TourAPI 연동 장소 검색으로 대체 예정)
          </Text>
        </>
      )}

      <Text style={{ fontSize: 11, fontWeight: '700', marginTop: 16, marginBottom: 8, color: colors.txMuted }}>
        사진 URL (선택)
      </Text>
      <FormInput
        value={photoUrl}
        onChangeText={setPhotoUrl}
        placeholder="https://..."
        style={{ marginBottom: 4 }}
      />
      <Text style={{ fontSize: 10, marginBottom: 8, color: colors.txPlaceholder }}>
        (데모: 실제 서비스에서는 이미지 업로드로 대체 예정)
      </Text>

      <Text style={{ fontSize: 11, fontWeight: '700', marginTop: 16, marginBottom: 8, color: colors.txMuted }}>
        글쓰기
      </Text>
      <FormInput
        value={caption}
        onChangeText={setCaption}
        placeholder="여행 이야기를 남겨보세요"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />

      <SubmitButton
        label="피드 등록하기"
        disabled={!canSubmit}
        onPress={() => {
          onSubmit({ placeId: mode === 'create' ? placeIdNumber : initialValue?.placeId ?? 0, caption, photoUrl });
          onClose();
        }}
      />
      <CancelButton onPress={onClose} />
    </BottomSheetModal>
  );
}