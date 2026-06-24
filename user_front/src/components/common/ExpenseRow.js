import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing, CATEGORY_META } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';

export default function ExpenseRow({ expense, isLast }) {
  const meta = CATEGORY_META[expense.cat] || CATEGORY_META.etc;
  return (
    <View style={[styles.row, !isLast && styles.divider]}>
      <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
        <Text style={styles.icon}>{expense.emoji || meta.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {expense.name}
        </Text>
        <Text style={styles.metaText} numberOfLines={1}>
          {expense.meta}
        </Text>
      </View>
      <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderTertiary,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  metaText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: 1,
  },
  amount: {
    fontSize: fontSize.ml,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
