import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../../src/constants/theme';
import { PLACES } from '../../../src/data/mockData';
import TopBar from '../../../src/components/common/TopBar';
import StepDots from '../../../src/components/trip/StepDots';

export default function FeedWriteStep1() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return PLACES;
    return PLACES.filter((p) => p.name.includes(query.trim()));
  }, [query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="장소 선택" showBack onBack={() => router.back()} />

      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <StepDots step={1} total={3} />
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="장소 이름으로 검색"
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.placeRow}
            onPress={() => router.push({ pathname: '/feed/write/step2', params: { placeId: item.id } })}
          >
            <View style={styles.placeIcon}>
              <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.placeName}>{item.name}</Text>
              <Text style={styles.placeDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.placeDist}>{item.dist}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.bgSecondary, borderRadius: radius.lg, paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: fontSize.lg, color: colors.textPrimary },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  placeRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.borderTertiary,
  },
  placeIcon: { width: 44, height: 44, borderRadius: radius.lg, backgroundColor: colors.tpLight, alignItems: 'center', justifyContent: 'center' },
  placeName: { fontSize: fontSize.lg, fontWeight: '500', color: colors.textPrimary },
  placeDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },
  placeDist: { fontSize: fontSize.sm, color: colors.textTertiary },
});
