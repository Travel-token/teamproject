import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize } from '../../constants/theme';

const COLOR_PAIR = {
  tp: { bg: colors.tpLight, fg: colors.tp },
  tt: { bg: colors.ttLight, fg: colors.tt },
  ta: { bg: colors.taLight, fg: colors.ta },
  tc: { bg: colors.tcLight, fg: colors.tc },
};

/** size: 'sm' | 'md' | 'lg' */
export default function Avatar({ label, colorKey = 'tp', size = 'md', filled = false, style }) {
  const pair = COLOR_PAIR[colorKey] || COLOR_PAIR.tp;
  const dim = size === 'sm' ? 34 : size === 'lg' ? 48 : 40;
  const fSize = size === 'sm' ? fontSize.sm : size === 'lg' ? fontSize.lg : fontSize.md;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: dim,
          height: dim,
          backgroundColor: filled ? pair.fg : pair.bg,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: filled ? colors.white : pair.fg, fontSize: fSize }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
