import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '../../src/constants/theme';
import { EXPENSE_FILTER_CATEGORIES } from '../../src/constants/config';
import { useTrip } from '../../src/context/TripContext';
import TopBar from '../../src/components/common/TopBar';
import { ChipRow, FilterChip } from '../../src/components/common/FilterChip';
import StatBox from '../../src/components/common/StatBox';
import ExpenseRow from '../../src/components/common/ExpenseRow';
import ExpenseAddModal from '../../src/components/modals/ExpenseAddModal';
import { formatCurrency } from '../../src/utils/format';
import { CATEGORY_META } from '../../src/constants/theme';

const FILTER_LABELS = {
  all: '전체',
  meal: '🍜 식사',
  ticket: '🎫 입장',
  cafe: '☕ 카페',
  shop: '🛒 쇼핑',
  trans: '🚗 교통',
};

export default function ExpensesScreen() {
  const router = useRouter();
  const { expenses, totalSpent, myShare, members } = useTrip();
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = useMemo(
    () => (filter === 'all' ? expenses : expenses.filter((e) => e.cat === filter)),
    [expenses, filter]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar
        title="지출 내역"
        showBack
        onBack={() => router.back()}
        right={
          <Ionicons
            name="receipt-outline"
            size={16}
            color={colors.textPrimary}
            onPress={() => setModalVisible(true)}
          />
        }
      />

      <View style={styles.statsRow}>
        <StatBox label="총 지출" value={formatCurrency(totalSpent)} sub={`${expenses.length}개 항목`} valueStyle={{ fontSize: fontSize.xl }} />
        <StatBox label="내 부담" value={formatCurrency(myShare)} sub={`${members.length}명 균등`} valueStyle={{ fontSize: fontSize.xl }} />
      </View>

      <ChipRow style={styles.chipRow}>
        {EXPENSE_FILTER_CATEGORIES.map((cat) => (
          <FilterChip key={cat} label={FILTER_LABELS[cat]} active={filter === cat} onPress={() => setFilter(cat)} />
        ))}
      </ChipRow>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => <ExpenseRow expense={item} isLast={index === filtered.length - 1} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>해당 카테고리의 지출이 없어요</Text>
          </View>
        }
      />

      <ExpenseAddModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, marginBottom: spacing.md },
  chipRow: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 60 },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: fontSize.md, color: colors.textTertiary },
});
