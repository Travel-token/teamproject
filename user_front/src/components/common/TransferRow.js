import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';

export default function TransferRow({ transfer, isLast }) {
  return (
    <View style={[styles.row, !isLast && styles.divider]}>
      <View style={styles.iconBox}>
        <Ionicons name="swap-horizontal" size={18} color={colors.tp} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {transfer.fromName} → {transfer.toName}
        </Text>
        <Text style={styles.metaText} numberOfLines={1}>
          {transfer.memo ? `${transfer.memo} · ` : ''}
          {transfer.timeLabel || '방금'}
        </Text>
      </View>
      <Text style={styles.amount}>{formatCurrency(transfer.amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  divider: { borderBottomWidth: 0.5, borderBottomColor: colors.borderTertiary },
  iconBox: {
    width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.tpLight,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  title: { fontSize: fontSize.lg, fontWeight: '500', color: colors.textPrimary },
  metaText: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 1 },
  amount: { fontSize: fontSize.ml, fontWeight: '600', color: colors.textPrimary },
});