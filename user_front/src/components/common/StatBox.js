import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

export default function StatBox({ label, value, sub, style, valueStyle }) {
  return (
    <View style={[styles.box, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
      {!!sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
  },
  label: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: fontSize.display,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
