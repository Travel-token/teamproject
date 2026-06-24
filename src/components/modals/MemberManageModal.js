import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import AppButton from '../common/AppButton';
import Avatar from '../common/Avatar';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';

export default function MemberManageModal({ visible, onClose, members = [] }) {
  const toast = useToast();

  const handleKick = (member) => {
    Alert.alert(`${member.name}님을 강퇴하시겠습니까?`, '', [
      { text: '취소', style: 'cancel' },
      {
        text: '강퇴',
        style: 'destructive',
        onPress: () => toast.show(`${member.name}님을 강퇴했습니다`),
      },
    ]);
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Text style={styles.title}>멤버 관리</Text>
      <Text style={styles.subtitle}>강퇴할 멤버를 선택하세요</Text>

      <View style={styles.list}>
        {members.map((m) => (
          <View key={m.id} style={styles.row}>
            <Avatar label={m.short} colorKey={m.color} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {m.name} {m.isMe ? '(나)' : ''}
              </Text>
              {!!m.role && <Text style={styles.role}>{m.role}</Text>}
            </View>
            {m.isMe ? (
              <Text style={styles.disabledText}>강퇴 불가</Text>
            ) : (
              <AppButton variant="small" title="강퇴" color={colors.tc} onPress={() => handleKick(m)} />
            )}
          </View>
        ))}
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>⚠️ 미정산 금액이 있는 멤버는 정산 완료 후 강퇴 가능합니다</Text>
      </View>

      <AppButton title="닫기" variant="secondary" onPress={onClose} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  list: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, borderBottomWidth: 0.5, borderBottomColor: colors.borderTertiary,
  },
  name: { fontSize: fontSize.lg, fontWeight: '500', color: colors.textPrimary },
  role: { fontSize: fontSize.sm, color: colors.textSecondary },
  disabledText: { fontSize: fontSize.base, color: colors.textTertiary },
  notice: { backgroundColor: colors.taLight, borderRadius: radius.md, padding: spacing.md - 2, marginBottom: spacing.md },
  noticeText: { fontSize: fontSize.base, color: colors.textSecondary },
});
