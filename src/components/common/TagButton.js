import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

export default function TagButton({ label, selected, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, selected ? styles.selected : styles.unselected, style]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: colors.tp,
    borderColor: colors.tp,
  },
  unselected: {
    backgroundColor: colors.bgSecondary,
    borderColor: colors.borderTertiary,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  selectedText: {
    color: colors.white,
  },
});
