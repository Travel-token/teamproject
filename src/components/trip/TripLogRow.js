import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

export default function TripLogRow({ log, isLast }) {
  return (
    <View style={styles.row}>
      <View style={styles.timelineCol}>
        <View style={styles.dot} />
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={[styles.content, !isLast && styles.spacerBottom]}>
        <Text style={styles.name}>{log.name}</Text>
        <Text style={styles.time}>{log.time}</Text>
        <View style={styles.tagRow}>
          {log.tagLabels?.map((label, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  timelineCol: { width: 18, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.tp, marginTop: 4 },
  line: { width: 2, flex: 1, backgroundColor: colors.tpLight, marginTop: 2 },
  content: { flex: 1, paddingLeft: spacing.sm },
  spacerBottom: { paddingBottom: spacing.lg },
  name: { fontSize: fontSize.lg, fontWeight: '500', color: colors.textPrimary },
  time: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  tagText: { fontSize: fontSize.sm, color: colors.textSecondary },
});
