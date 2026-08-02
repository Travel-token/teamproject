import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';

interface RecItem {
  id: string;
  emoji: string;
  place: string;
  photoCount: number;
}

const REC_ITEMS: RecItem[] = [
  { id: 'r1', emoji: '🌅', place: '성산일출봉, 제주', photoCount: 3 },
  { id: 'r2', emoji: '🥩', place: '흑돼지 구이 맛집', photoCount: 2 },
  { id: 'r3', emoji: '☕', place: '제주 감귤 카페', photoCount: 1 },
  { id: 'r4', emoji: '🌊', place: '협재 바다', photoCount: 2 },
];

export default function FeedRecommendModal({
  visible,
  onClose,
  onCreateFeeds,
}: {
  visible: boolean;
  onClose: () => void;
  onCreateFeeds: (ids: string[]) => void;
}) {
  const { colors } = useTheme();
  const [checked, setChecked] = useState<string[]>(['r1', 'r2']);

  useEffect(() => {
    if (visible) setChecked(['r1', 'r2']);
  }, [visible]);

  const toggle = (id: string) => setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="✨ AI 추천 피드">
      <Text style={[styles.desc, { color: colors.txMuted }]}>
        제주도 여름 여행에서 공유된 사진·장소 기록을 분석했어요.{'\n'}피드로 올릴 항목을 선택해주세요.
      </Text>
      <View>
        {REC_ITEMS.map((item) => {
          const isChecked = checked.includes(item.id);
          return (
            <Pressable key={item.id} onPress={() => toggle(item.id)} style={[styles.row, { borderColor: colors.bdCard }]}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: isChecked ? colors.bgChipActive : colors.bdCard,
                    backgroundColor: isChecked ? colors.bgChipActive : 'transparent',
                  },
                ]}
              >
                {isChecked && <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>✓</Text>}
              </View>
              <View style={[styles.thumb, { backgroundColor: colors.bgCard2 }]}>
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.place, { color: colors.txPrimary }]}>{item.place}</Text>
                <Text style={[styles.meta, { color: colors.txMuted }]}>사진 {item.photoCount}장</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <SubmitButton
        label={`선택한 ${checked.length}개로 피드 만들기`}
        disabled={checked.length === 0}
        onPress={() => {
          onCreateFeeds(checked);
          onClose();
        }}
      />
      <CancelButton label="나중에 할게요" onPress={onClose} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  place: { fontSize: 13, fontWeight: '600' },
  meta: { fontSize: 11, marginTop: 2 },
});
