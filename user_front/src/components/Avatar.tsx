import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  label: string;
  size?: number;
  faded?: boolean;
}

export default function Avatar({ label, size = 34, faded }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.bgAvatar,
          opacity: faded ? 0.4 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { fontSize: size * 0.34 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  label: { color: '#FFFFFF', fontWeight: '700' },
});
