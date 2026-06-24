import React from 'react';
import { Pressable, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

export function FilterChip({ label, active, onPress, icon }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.active : styles.inactive]}>
      {icon}
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, style]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 0.5,
  },
  active: {
    backgroundColor: colors.tp,
    borderColor: colors.tp,
  },
  inactive: {
    backgroundColor: colors.bgSecondary,
    borderColor: colors.borderTertiary,
  },
  text: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeText: {
    color: colors.white,
  },
});
