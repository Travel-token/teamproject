import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { FEED_POSTS, PLACES } from '../../src/data/mockData';
import TopBar from '../../src/components/common/TopBar';
import { formatViews } from '../../src/utils/format';

export default function FeedDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const post = FEED_POSTS.find((p) => p.id === id) || FEED_POSTS[0];
  const place = PLACES.find((p) => p.id === post.placeId);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    // 백엔드 연동 지점: POST/DELETE /api/feed/{id}/like
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title={place?.name || '피드'} showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageBox}>
          <Text style={{ fontSize: 60 }}>{place?.emoji || '📍'}</Text>
        </View>

        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 14 }}>🧳</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.time}>{post.time}</Text>
          </View>
        </View>

        <Text style={styles.caption}>{post.caption}</Text>

        <View style={styles.placeCard}>
          <Text style={styles.placeName}>{place?.emoji} {place?.name}</Text>
          <Text style={styles.placeDesc}>{place?.desc}</Text>
          <Text style={styles.placeMeta}>{place?.addr} · 평균 {place?.avg}</Text>
        </View>

        <View style={styles.statsRow}>
          <Pressable style={styles.statBtn} onPress={toggleLike}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? colors.tc : colors.textSecondary} />
            <Text style={styles.statText}>{formatViews(likeCount)}</Text>
          </Pressable>
          <View style={styles.statBtn}>
            <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.statText}>{formatViews(post.views)}</Text>
          </View>
          <View style={styles.statBtn}>
            <Ionicons name="chatbubble-outline" size={19} color={colors.textSecondary} />
            <Text style={styles.statText}>{post.comments}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable style={styles.statBtn}>
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scrollContent: { paddingBottom: 60 },
  imageBox: {
    height: 280, backgroundColor: colors.tpLight, alignItems: 'center', justifyContent: 'center',
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.xl, paddingBottom: spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.tpLight, alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary },
  time: { fontSize: fontSize.sm, color: colors.textTertiary },
  caption: { fontSize: fontSize.lg, color: colors.textPrimary, paddingHorizontal: spacing.xl, lineHeight: 23, marginBottom: spacing.lg },
  placeCard: {
    marginHorizontal: spacing.xl, padding: spacing.lg, backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg, marginBottom: spacing.lg,
  },
  placeName: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  placeDesc: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: 4 },
  placeMeta: { fontSize: fontSize.sm, color: colors.textTertiary },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    paddingHorizontal: spacing.xl, borderTopWidth: 0.5, borderTopColor: colors.borderTertiary, paddingTop: spacing.md,
  },
  statBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: '500' },
});
