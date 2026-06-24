import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../../constants/theme';

/** step: 1-based current step, total: 전체 단계 수 */
export default function StepDots({ step, total }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i + 1 === step ? styles.activeDot : i + 1 < step ? styles.doneDot : styles.idleDot]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 18 },
  dot: { height: 4, borderRadius: radius.round, flex: 1 },
  activeDot: { backgroundColor: colors.tp },
  doneDot: { backgroundColor: colors.tp, opacity: 0.5 },
  idleDot: { backgroundColor: colors.borderTertiary },
});
