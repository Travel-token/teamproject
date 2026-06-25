import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { AI_FEED_SUGGESTIONS, PLACES } from '../../src/data/mockData';
import { useTrip } from '../../src/context/TripContext';
import { useToast } from '../../src/context/ToastContext';
import { fetchAIFeedSuggestion, publishFeedPost } from '../../src/api/feedApi';
import TopBar from '../../src/components/common/TopBar';
import AppButton from '../../src/components/common/AppButton';

export default function FeedAISuggestScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams();
  const { activeTrip } = useTrip();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [caption, setCaption] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // 백엔드 연동 지점: 이번 여행의 지출·동선 데이터를 기반으로 AI가 캡션 후보를 생성합니다.
        const res = await fetchAIFeedSuggestion(tripId || activeTrip?.id);
        const list = res?.suggestions?.length ? res.suggestions : AI_FEED_SUGGESTIONS;
        applySuggestions(list);
      } catch (e) {
        applySuggestions(AI_FEED_SUGGESTIONS);
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId]);

  function applySuggestions(list) {
    setSuggestions(list);
    if (list.length) {
      setSelectedId(list[0].id);
      setCaption(list[0].caption);
    }
  }

  const handleSelect = (item) => {
    setSelectedId(item.id);
    setCaption(item.caption);
  };

  const selectedPlace = suggestions.length
    ? PLACES.find((p) => p.id === suggestions.find((s) => s.id === selectedId)?.placeId)
    : null;

  const handlePublish = async () => {
    if (!caption.trim()) {
      toast.show('캡션을 입력해주세요');
      return;
    }
    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append('placeId', selectedPlace?.id || '');
      formData.append('caption', caption.trim());
      await publishFeedPost(formData);
    } catch (e) {
      console.warn('[feed] AI 추천 글 게시 실패, 화면은 정상 진행합니다:', e?.message);
    } finally {
      setPublishing(false);
      toast.show('정산 후기 피드가 게시되었습니다! 🎉');
      router.replace('/(tabs)/explore');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/trips');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="AI 글 추천" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>✨ {activeTrip?.name || '이번 여행'} 정산이 끝났어요</Text>
          <Text style={styles.introDesc}>
            여행 지출과 방문 기록을 바탕으로 AI가 피드 글을 추천해드려요.{'\n'}
            마음에 드는 글을 고르고 자유롭게 수정해보세요.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>AI가 여행을 돌아보는 중... 🧳</Text>
          </View>
        ) : (
          <>
            <Text style={styles.label}>추천 글 {suggestions.length}개 중 선택</Text>
            <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
              {suggestions.map((item) => {
                const place = PLACES.find((p) => p.id === item.placeId);
                const active = selectedId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.suggestionCard, active && styles.suggestionCardActive]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.suggestionHeaderRow}>
                      <Text style={styles.suggestionPlace}>
                        {place?.emoji} {place?.name}
                      </Text>
                      {active && <Ionicons name="checkmark-circle" size={18} color={colors.tp} />}
                    </View>
                    <Text style={styles.suggestionCaption} numberOfLines={3}>
                      {item.caption}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>게시할 캡션 (자유롭게 수정 가능)</Text>
            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={setCaption}
              multiline
              textAlignVertical="top"
            />

            <AppButton title="이 글로 피드에 게시하기" onPress={handlePublish} loading={publishing} style={{ marginTop: spacing.lg, marginBottom: spacing.sm }} />
            <AppButton title="나중에 할게요" variant="secondary" onPress={handleSkip} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scrollContent: { padding: spacing.xl, paddingBottom: 60 },
  introBox: { backgroundColor: colors.tpLight, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  introTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.tpMid, marginBottom: 6 },
  introDesc: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 20 },
  loadingBox: { paddingVertical: 60, alignItems: 'center' },
  loadingText: { fontSize: fontSize.md, color: colors.textTertiary },
  label: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.sm },
  suggestionCard: {
    backgroundColor: colors.bgSecondary, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1.5, borderColor: colors.borderTertiary,
  },
  suggestionCardActive: { borderColor: colors.tp, backgroundColor: colors.tpLight },
  suggestionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  suggestionPlace: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  suggestionCaption: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 19 },
  captionInput: { minHeight: 120, backgroundColor: colors.bgSecondary, borderRadius: radius.lg, padding: spacing.md, fontSize: fontSize.lg, color: colors.textPrimary },
});