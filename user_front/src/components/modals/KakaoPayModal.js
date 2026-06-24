import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import BottomSheetModal from '../common/BottomSheetModal';
import AppButton from '../common/AppButton';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';

export default function KakaoPayModal({ visible, onClose, route, onSent }) {
  const toast = useToast();

  const handleSend = () => {
    toast.show('카카오페이로 송금 요청을 보냈어요! 💛');
    onSent?.(route);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeightRatio={0.6}>
      <View style={styles.logoRow}>
        <Svg width={28} height={28} viewBox="0 0 24 24">
          <Rect width={24} height={24} rx={6} fill="#FEE500" />
          <Path d="M12 4C7.58 4 4 6.91 4 10.5c0 2.28 1.47 4.29 3.7 5.43l-.7 2.59 3.02-2a9.2 9.2 0 0 0 1.98.22c4.42 0 8-2.91 8-6.5S16.42 4 12 4z" fill="#3C1E1E" />
        </Svg>
        <Text style={styles.title}>카카오페이로 송금</Text>
      </View>

      {route && (
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>받는 사람</Text>
            <Text style={styles.infoValue}>{route.to}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>송금 금액</Text>
            <Text style={styles.infoAmount}>{formatCurrency(route.amount)}</Text>
          </View>
        </View>
      )}

      <Text style={styles.note}>카카오페이 앱으로 이동하여 송금을 완료해주세요</Text>

      <AppButton title="카카오페이 앱으로 이동" onPress={handleSend} style={{ backgroundColor: '#FEE500', marginBottom: spacing.sm }} textStyle={{ color: '#3C1E1E' }} />
      <AppButton title="취소" variant="secondary" onPress={onClose} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.textPrimary },
  infoBox: { backgroundColor: colors.bgSecondary, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  infoLabel: { fontSize: fontSize.md, color: colors.textSecondary },
  infoValue: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  infoAmount: { fontSize: fontSize.xl, fontWeight: '700', color: colors.tp },
  note: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
});
