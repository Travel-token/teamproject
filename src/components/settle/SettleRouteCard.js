import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';

const COLOR_MAP = { tp: colors.tp, tt: colors.tt, ta: colors.ta, tc: colors.tc };

export default function SettleRouteCard({ route }) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: COLOR_MAP[route.fromColor] }]}>
        <Text style={styles.avatarText}>{route.from}</Text>
      </View>
      <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
      <View style={[styles.avatar, { backgroundColor: COLOR_MAP[route.toColor] }]}>
        <Text style={styles.avatarText}>{route.to}</Text>
      </View>
      <Text style={styles.amount}>{formatCurrency(route.amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderTertiary,
  },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '700' },
  amount: { flex: 1, textAlign: 'right', fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary },
});
