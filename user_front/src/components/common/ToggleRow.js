import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../../constants/theme';

export default function ToggleRow({ icon, label, value, onValueChange, noBorder = false }) {
  return (
    <View style={[styles.row, noBorder && styles.noBorder]}>
      <View style={styles.left}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderSecondary, true: colors.tp }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderTertiary,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
});
