import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

const VARIANT_COLORS = {
  purple: { bg: colors.tpLight, fg: colors.tpMid },
  teal: { bg: colors.ttLight, fg: colors.ttMid },
  coral: { bg: colors.tcLight, fg: colors.tc },
  amber: { bg: colors.taLight, fg: colors.ta },
  blue: { bg: colors.tbLight, fg: colors.tb },
};

export default function Pill({ label, variant = 'purple', style, textStyle, icon }) {
  const c = VARIANT_COLORS[variant] || VARIANT_COLORS.purple;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }, style]}>
      {icon}
      <Text style={[styles.text, { color: c.fg }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
