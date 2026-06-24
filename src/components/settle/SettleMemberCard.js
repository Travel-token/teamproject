import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import Avatar from '../common/Avatar';
import { formatCurrency } from '../../utils/format';

const STATUS_META = {
  done: { label: '✅ 입금완료', bg: colors.ttLight, fg: colors.ttMid },
  requested: { label: '📨 요청됨', bg: colors.taLight, fg: colors.ta },
  pending: { label: '⏳ 대기중', bg: colors.bgSecondary, fg: colors.textSecondary },
};

export default function SettleMemberCard({ member, status, onNudge, onConfirm }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const isPositive = member.net >= 0;

  return (
    <View style={styles.row}>
      <Avatar label={member.short} colorKey={member.colorKey} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.paid}>결제 {formatCurrency(member.paid)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={[styles.net, { color: isPositive ? colors.tt : colors.tc }]}>
          {isPositive ? '+' : ''}
          {formatCurrency(member.net)}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
          <Text style={[styles.statusText, { color: meta.fg }]}>{meta.label}</Text>
        </View>
      </View>
      {!isPositive && status !== 'done' && onNudge && (
        <Pressable style={styles.nudgeBtn} onPress={onNudge}>
          <Text style={styles.nudgeText}>독촉</Text>
        </Pressable>
      )}
      {status === 'requested' && onConfirm && (
        <Pressable style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.confirmText}>확인</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm + 2, borderBottomWidth: 0.5, borderBottomColor: colors.borderTertiary },
  name: { fontSize: fontSize.lg, fontWeight: '500', color: colors.textPrimary },
  paid: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },
  net: { fontSize: fontSize.ml, fontWeight: '700' },
  statusPill: { borderRadius: radius.pill, paddingVertical: 2, paddingHorizontal: 8 },
  statusText: { fontSize: fontSize.sm, fontWeight: '500' },
  nudgeBtn: { backgroundColor: colors.bgSecondary, borderRadius: radius.sm, paddingVertical: 5, paddingHorizontal: 9, marginLeft: 4 },
  nudgeText: { fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: '500' },
  confirmBtn: { backgroundColor: colors.tp, borderRadius: radius.sm, paddingVertical: 5, paddingHorizontal: 9, marginLeft: 4 },
  confirmText: { fontSize: fontSize.sm, color: colors.white, fontWeight: '500' },
});
