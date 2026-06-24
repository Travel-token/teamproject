import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '../../constants/theme';
import { formatViews } from '../../utils/format';

// 카드 비율을 살짝 랜덤하게 줘서 원본의 masonry(핀터레스트 스타일) 느낌을 재현
const HEIGHT_VARIANTS = [150, 190, 170, 210, 160];

export default function FeedGridItem({ post, place, index, onPress }) {
  const height = HEIGHT_VARIANTS[index % HEIGHT_VARIANTS.length];

  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <View style={[styles.imageBox, { height }]}>
        <Text style={styles.placeEmoji}>{place?.emoji || '📍'}</Text>
        <View style={styles.overlay}>
          <View style={styles.statsRow}>
            <Ionicons name="heart" size={11} color={colors.white} />
            <Text style={styles.statsText}>{formatViews(post.likes)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.caption} numberOfLines={2}>
        {post.caption}
      </Text>
      <Text style={styles.meta}>
        {place?.name} · {post.time}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 1, marginBottom: spacing.sm },
  imageBox: {
    backgroundColor: colors.tpLight,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  placeEmoji: { fontSize: 36 },
  overlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  statsText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '600' },
  caption: { fontSize: fontSize.base, color: colors.textPrimary, marginTop: 4, paddingHorizontal: 2 },
  meta: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: 2, paddingHorizontal: 2 },
});
