import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

export default function GpsBanner({ placeName = '불국사', onRecordExpense }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="location-outline" size={20} color={colors.tt} style={{ marginTop: 1 }} />
      <View style={styles.content}>
        <Text style={styles.title}>{placeName} 근처에 계신가요?</Text>
        <Text style={styles.desc}>GPS 반경 150m 이내 감지됨</Text>
        <View style={styles.btnRow}>
          <Pressable
            style={styles.yesBtn}
            onPress={() => {
              setDismissed(true);
              onRecordExpense?.();
            }}
          >
            <Text style={styles.yesText}>지출 기록하기</Text>
          </Pressable>
          <Pressable style={styles.noBtn} onPress={() => setDismissed(true)}>
            <Text style={styles.noText}>아니요</Text>
          </Pressable>
        </View>
      </View>
      <Pressable onPress={() => setDismissed(true)}>
        <Text style={styles.closeBtn}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.xl,
    marginTop: 10,
    padding: spacing.md + 2,
    backgroundColor: colors.ttLight,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.tt,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  content: { flex: 1 },
  title: { fontSize: fontSize.md, fontWeight: '600', color: colors.ttMid },
  desc: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  yesBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.tt,
  },
  yesText: { fontSize: fontSize.base, color: colors.white, fontWeight: '500' },
  noBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.tt,
  },
  noText: { fontSize: fontSize.base, color: colors.tt, fontWeight: '500' },
  closeBtn: { fontSize: 20, color: colors.tt, marginTop: -2 },
});
