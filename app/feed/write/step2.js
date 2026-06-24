import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../../src/constants/theme';
import { PLACES } from '../../../src/data/mockData';
import TopBar from '../../../src/components/common/TopBar';
import StepDots from '../../../src/components/trip/StepDots';
import AppButton from '../../../src/components/common/AppButton';

const MAX_PHOTOS = 5;
const MAX_CAPTION = 500;

export default function FeedWriteStep2() {
  const router = useRouter();
  const { placeId } = useLocalSearchParams();
  const place = PLACES.find((p) => p.id === placeId) || PLACES[0];

  // 실제로는 expo-image-picker로 갤러리/카메라에서 선택한 이미지 URI 배열을 다룹니다.
  const [photoCount, setPhotoCount] = useState(0);
  const [caption, setCaption] = useState('');

  const addMockPhoto = () => {
    if (photoCount >= MAX_PHOTOS) return;
    setPhotoCount((c) => c + 1);
  };

  const canNext = photoCount > 0 && caption.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="사진 · 글쓰기" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 40 }}>
        <StepDots step={2} total={3} />

        <View style={styles.placeBadge}>
          <Text style={{ fontSize: 16 }}>{place.emoji}</Text>
          <Text style={styles.placeBadgeText}>{place.name}</Text>
        </View>

        <Text style={styles.label}>사진 ({photoCount}/{MAX_PHOTOS})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
          <Pressable style={styles.addPhotoBox} onPress={addMockPhoto}>
            <Ionicons name="camera-outline" size={26} color={colors.tp} />
            <Text style={styles.addPhotoText}>추가</Text>
          </Pressable>
          {Array.from({ length: photoCount }).map((_, i) => (
            <View key={i} style={styles.photoThumb}>
              <Text style={{ fontSize: 24 }}>🖼️</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.label}>캡션</Text>
        <TextInput
          style={styles.captionInput}
          placeholder={`${place.name}에서의 순간을 기록해보세요`}
          placeholderTextColor={colors.textTertiary}
          value={caption}
          onChangeText={(v) => setCaption(v.slice(0, MAX_CAPTION))}
          multiline
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{caption.length}/{MAX_CAPTION}</Text>

        <AppButton
          title="다음"
          disabled={!canNext}
          onPress={() =>
            router.push({
              pathname: '/feed/write/step3',
              params: { placeId: place.id, caption, photoCount: String(photoCount) },
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  placeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: colors.tpLight, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12,
    marginBottom: spacing.lg,
  },
  placeBadgeText: { fontSize: fontSize.md, color: colors.tpMid, fontWeight: '600' },
  label: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.sm },
  addPhotoBox: {
    width: 84, height: 84, borderRadius: radius.lg, backgroundColor: colors.bgSecondary,
    borderWidth: 1.5, borderColor: colors.borderSecondary, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  addPhotoText: { fontSize: fontSize.sm, color: colors.tp, marginTop: 4 },
  photoThumb: {
    width: 84, height: 84, borderRadius: radius.lg, backgroundColor: colors.tpLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  captionInput: {
    minHeight: 120, backgroundColor: colors.bgSecondary, borderRadius: radius.lg,
    padding: spacing.md, fontSize: fontSize.lg, color: colors.textPrimary, marginBottom: 4,
  },
  charCount: { fontSize: fontSize.sm, color: colors.textTertiary, textAlign: 'right', marginBottom: spacing.lg },
});
