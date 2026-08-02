import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, FormInput, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';

const PHOTO_EMOJIS = ['🌊', '🥩', '🌅', '☕', '🏖️', '🌿', '🍜', '🐴'];

export interface FeedFormValue {
  place: string;
  caption: string;
  emoji: string;
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
  const [place, setPlace] = useState('');
  const [caption, setCaption] = useState('');
  const [emoji, setEmoji] = useState(PHOTO_EMOJIS[0]);

  useEffect(() => {
    if (visible) {
      setPlace(initialValue?.place ?? '');
      setCaption(initialValue?.caption ?? '');
      setEmoji(initialValue?.emoji ?? PHOTO_EMOJIS[0]);
    }
  }, [visible, initialValue]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title={mode === 'create' ? '피드 작성' : '피드 수정'} maxHeightPct={90}>
      <Text style={[styles.label, { color: colors.txMuted }]}>여행지</Text>
      <FormInput value={place} onChangeText={setPlace} placeholder="예: 성산일출봉, 제주" style={{ marginBottom: 4 }} />
      <Text style={[styles.hint, { color: colors.txPlaceholder }]}>
        (데모: 실제 서비스에서는 한국관광공사 TourAPI 연동 검색으로 대체 예정)
      </Text>

      <Text style={[styles.label, { color: colors.txMuted }]}>사진 (대표 이모지 선택)</Text>
      <View style={styles.photoGrid}>
        {PHOTO_EMOJIS.map((e) => (
          <Pressable
            key={e}
            onPress={() => setEmoji(e)}
            style={[styles.photoCell, { backgroundColor: e === emoji ? colors.bgChipActive : colors.bgCard2 }]}
          >
            <Text style={{ fontSize: 22 }}>{e}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.txMuted }]}>글쓰기</Text>
      <FormInput
        value={caption}
        onChangeText={setCaption}
        placeholder="여행 이야기를 남겨보세요"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />

      <SubmitButton
        label="피드 등록하기"
        onPress={() => {
          onSubmit({ place: place || '새로운 장소', caption: caption || '', emoji });
          onClose();
        }}
      />
      <CancelButton onPress={onClose} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  hint: { fontSize: 10, marginBottom: 8 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoCell: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
