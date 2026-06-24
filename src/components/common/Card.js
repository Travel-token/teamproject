import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, shadow } from '../../constants/theme';

export default function Card({ children, style, onPress, noPadding = false }) {
  const content = (
    <View style={[styles.card, noPadding && styles.noPadding, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgPrimary,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
    borderRadius: radius.xxl,
    padding: spacing.lg,
  },
  noPadding: {
    padding: 0,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
  },
});
