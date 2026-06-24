import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

/**
 * 원본은 안드로이드 결제 알림(SMS/알림 리스너) 연동을 가정한 배너입니다.
 * RN에서는 Android에서만 알림 리스너 권한을 받아 유사 기능을 구현할 수 있습니다.
 * (iOS는 OS 정책상 타사 결제 알림 접근이 불가능합니다)
 */
export default function PaymentDetectBanner({ payment, onRegister, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || Platform.OS === 'ios' || !payment) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <View style={styles.banner}>
      <View style={styles.iconBox}>
        <Ionicons name="card-outline" size={18} color={colors.tb} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>카드 결제 감지됨</Text>
        <Text style={styles.merchant}>
          {payment.merchant} · ₩{payment.amount?.toLocaleString()}
        </Text>
        <Text style={styles.detail}>
          {payment.dateLabel} · {payment.cardName}
        </Text>
        <View style={styles.btnRow}>
          <Pressable
            style={styles.registerBtn}
            onPress={() => {
              setDismissed(true);
              onRegister?.();
            }}
          >
            <Text style={styles.registerText}>등록하기</Text>
          </Pressable>
          <Pressable style={styles.deleteBtn} onPress={handleDismiss}>
            <Text style={styles.deleteText}>지우기</Text>
          </Pressable>
        </View>
      </View>
      <Pressable onPress={handleDismiss}>
        <Text style={styles.closeBtn}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.xl,
    marginTop: 0,
    marginBottom: 10,
    padding: spacing.md + 2,
    backgroundColor: colors.bgPrimary,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.tbLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  label: { fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary },
  merchant: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary, marginTop: 1 },
  detail: { fontSize: fontSize.sm, color: colors.textSecondary },
  btnRow: { flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  registerBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.tp,
  },
  registerText: { fontSize: fontSize.base, color: colors.white, fontWeight: '500' },
  deleteBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.tp,
  },
  deleteText: { fontSize: fontSize.base, color: colors.tp, fontWeight: '500' },
  closeBtn: { fontSize: 18, color: colors.textTertiary },
});
