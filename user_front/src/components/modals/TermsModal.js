import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal } from 'react-native';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import ToggleRow from '../common/ToggleRow';
import AppButton from '../common/AppButton';
import { useToast } from '../../context/ToastContext';

const TERMS_ITEMS = [
  { key: 't1', title: '[필수] 서비스 이용약관', desc: '서비스 제공을 위한 필수 약관입니다' },
  { key: 't2', title: '[필수] 개인정보 수집 및 이용', desc: 'GPS 위치 정보 포함' },
  { key: 't3', title: '[선택] 마케팅 정보 수신', desc: '여행 관련 혜택 및 소식 알림' },
  { key: 't2b', title: '[필수] GPS 위치 정보 이용 동의', desc: '주변 관광지 추천·동선 기록에 활용' },
];

export default function TermsModal({ visible }) {
  const { terms, toggleTerm, requiredAgreed, agreeTermsAndLogin, user } = useAuth();
  const toast = useToast();

  const handleAgree = async () => {
    await agreeTermsAndLogin();
    toast.show(`환영합니다, ${user.name}님! 🎉`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>서비스 이용약관</Text>
          <Text style={styles.subtitle}>Travel Token을 시작하기 전에 동의해주세요</Text>

          <View style={styles.list}>
            {TERMS_ITEMS.map((item) => (
              <View key={item.key} style={styles.itemRow}>
                <View style={styles.itemTextWrap}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </View>
                <ToggleRowSwitchOnly value={terms[item.key]} onValueChange={() => toggleTerm(item.key)} />
              </View>
            ))}
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeText}>📌 필수 항목 3개를 모두 동의해야 가입이 완료됩니다</Text>
          </View>

          <AppButton title="가입 완료" onPress={handleAgree} disabled={!requiredAgreed} />
        </View>
      </View>
    </Modal>
  );
}

// 약관 모달 안에서는 라벨 없이 스위치만 필요해서 간단히 분리
function ToggleRowSwitchOnly({ value, onValueChange }) {
  const { Switch } = require('react-native');
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.borderSecondary, true: colors.tp }}
      thumbColor={colors.white}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgPrimary,
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderSecondary,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: fontSize.h2, fontWeight: '700', marginBottom: 4, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xl },
  list: { gap: spacing.sm, marginBottom: spacing.xl },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
  },
  itemTextWrap: { flex: 1, paddingRight: spacing.md },
  itemTitle: { fontSize: fontSize.lg, fontWeight: '500', color: colors.textPrimary },
  itemDesc: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 2 },
  notice: {
    backgroundColor: colors.tpLight,
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: { fontSize: fontSize.base, color: colors.textSecondary },
});
