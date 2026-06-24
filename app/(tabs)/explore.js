import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius, shadow } from '../../src/constants/theme';
import { FEED_SORT } from '../../src/constants/config';
import { FEED_POSTS, PLACES } from '../../src/data/mockData';
import { ChipRow, FilterChip } from '../../src/components/common/FilterChip';
import FeedGridItem from '../../src/components/feed/FeedGridItem';

const SORT_TABS = [
  { key: FEED_SORT.NEAR, label: '가까운 순', icon: 'location-outline' },
  { key: FEED_SORT.POPULAR, label: '인기순', icon: 'flame-outline' },
  { key: FEED_SORT.RECENT, label: '최신순', icon: 'time-outline' },
];

function sortFeed(posts, sort) {
  const list = [...posts];
  if (sort === FEED_SORT.NEAR) return list.sort((a, b) => a.distKm - b.distKm);
  if (sort === FEED_SORT.POPULAR) return list.sort((a, b) => b.likes - a.likes);
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export default function ExploreScreen() {
  const router = useRouter();
  const [sort, setSort] = useState(FEED_SORT.NEAR);

  const placeById = useMemo(() => Object.fromEntries(PLACES.map((p) => [p.id, p])), []);
  const sortedPosts = useMemo(() => sortFeed(FEED_POSTS, sort), [sort]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>피드</Text>
          <View style={styles.locChip}>
            <Ionicons name="location-outline" size={12} color={colors.textPrimary} />
            <Text style={styles.locChipText}>황성동 기준</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable style={styles.searchBtn} onPress={() => router.push('/feed/write/step1')}>
            <Ionicons name="search" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
        <ChipRow style={styles.chipRow}>
          {SORT_TABS.map((tab) => (
            <FilterChip
              key={tab.key}
              label={tab.label}
              active={sort === tab.key}
              icon={<Ionicons name={tab.icon} size={11} color={sort === tab.key ? colors.white : colors.textSecondary} />}
              onPress={() => setSort(tab.key)}
            />
          ))}
        </ChipRow>
      </View>

      <FlatList
        data={sortedPosts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={{ gap: spacing.sm }}
        renderItem={({ item, index }) => (
          <View style={{ flex: 1 }}>
            <FeedGridItem
              post={item}
              place={placeById[item.placeId]}
              index={index}
              onPress={() => router.push(`/feed/${item.id}`)}
            />
          </View>
        )}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/feed/write/step1')}>
        <Ionicons name="create-outline" size={22} color={colors.white} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.borderTertiary },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.textPrimary },
  locChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
    borderRadius: radius.sm,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  locChipText: { fontSize: fontSize.sm, color: colors.textPrimary },
  searchBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { paddingBottom: spacing.md },
  gridContent: { padding: spacing.sm, paddingBottom: 110 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.tp,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
});
