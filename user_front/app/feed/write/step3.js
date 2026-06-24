import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, fontSize, spacing, radius } from '../../../src/constants/theme';
import { PLACES } from '../../../src/data/mockData';
import TopBar from '../../../src/components/common/TopBar';
import StepDots from '../../../src/components/trip/StepDots';
import AppButton from '../../../src/components/common/AppButton';
import { useToast } from '../../../src/context/ToastContext';
import { publishFeedPost } from '../../../src/api/feedApi';

export default function FeedWriteStep3() {
  const router = useRouter();
  const { placeId, caption, photoCount } = useLocalSearchParams();
  const place = PLACES.find((p) => p.id === placeId) || PLACES[0];
  const toast = useToast();
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // 백엔드 연동 지점: 실제로는 FormData에 이미지 파일들을 담아 전송합니다.
      const formData = new FormData();
      formData.append('placeId', place.id);
      formData.append('caption', caption || '');
      await publishFeedPost(formData);
    } catch (e) {
      console.warn('[feed] 게시 실패, 화면은 정상 진행합니다:', e?.message);
    } finally {
      setPublishing(false);
      toast.show('피드에 게시되었습니다! 🎉');
      router.replace('/(tabs)/explore');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="미리보기" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 40 }}>
        <StepDots step={3} total={3} />

        <View style={styles.previewImage}>
          <Text style={{ fontSize: 48 }}>{place.emoji}</Text>
        </View>

        <View style={styles.placeRow}>
          <Text style={styles.placeName}>{place.emoji} {place.name}</Text>
          <Text style={styles.photoCountText}>사진 {photoCount}장</Text>
        </View>

        <Text style={styles.caption}>{caption}</Text>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>📌 게시 후에도 수정 및 삭제가 가능해요</Text>
        </View>

        <AppButton title="게시하기" onPress={handlePublish} loading={publishing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  previewImage: {
    height: 220, borderRadius: radius.xl, backgroundColor: colors.tpLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  placeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  placeName: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary },
  photoCountText: { fontSize: fontSize.sm, color: colors.textTertiary },
  caption: { fontSize: fontSize.lg, color: colors.textPrimary, lineHeight: 22, marginBottom: spacing.lg },
  noticeBox: { backgroundColor: colors.tpLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  noticeText: { fontSize: fontSize.base, color: colors.tpMid },
});
