import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Path } from 'react-native-svg';
import BottomSheetModal from '../common/BottomSheetModal';
import AppButton from '../common/AppButton';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';

const SHARE_LINK = 'https://traveltoken.kr/route/GJ-2026-MAP';

export default function RouteShareModal({ visible, onClose, trip }) {
  const toast = useToast();

  const handleShare = (type) => {
    const labels = {
      link: '링크가 복사되었습니다!',
      kakao: '카카오톡으로 공유되었습니다!',
      insta: '인스타그램 스토리가 생성됐어요!',
      other: '공유 시트가 열렸어요',
    };
    toast.show(labels[type]);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Text style={styles.title}>동선 공유하기</Text>
      <Text style={styles.subtitle}>
        {trip?.emoji} {trip?.name} · 방문 {trip?.placesVisited}곳
      </Text>

      <View style={styles.linkBox}>
        <Text style={styles.linkText}>{SHARE_LINK}</Text>
      </View>

      <View style={styles.optionList}>
        <AppButton
          title="링크 복사"
          icon={<Ionicons name="copy-outline" size={19} color={colors.white} />}
          onPress={() => handleShare('link')}
          style={styles.optionBtn}
        />
        <AppButton
          variant="secondary"
          title="카카오톡 공유"
          icon={
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Rect width={24} height={24} rx={5} fill="#FEE500" />
              <Path
                d="M12 4C7.58 4 4 6.91 4 10.5c0 2.28 1.47 4.29 3.7 5.43l-.7 2.59 3.02-2a9.2 9.2 0 0 0 1.98.22c4.42 0 8-2.91 8-6.5S16.42 4 12 4z"
                fill="#3C1E1E"
              />
            </Svg>
          }
          onPress={() => handleShare('kakao')}
          style={styles.optionBtn}
        />
        <AppButton
          variant="secondary"
          title="인스타그램 스토리"
          icon={<Ionicons name="logo-instagram" size={19} color="#E1306C" />}
          onPress={() => handleShare('insta')}
          style={styles.optionBtn}
        />
        <AppButton
          variant="secondary"
          title="기타 앱으로 공유"
          icon={<Ionicons name="share-outline" size={19} color={colors.tp} />}
          onPress={() => handleShare('other')}
          style={styles.optionBtn}
        />
      </View>

      <AppButton title="닫기" variant="secondary" onPress={onClose} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  linkBox: {
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
    marginBottom: spacing.md,
  },
  linkText: { fontSize: fontSize.base, color: colors.textSecondary },
  optionList: { gap: spacing.sm, marginBottom: spacing.md },
  optionBtn: { justifyContent: 'flex-start', paddingHorizontal: spacing.lg, gap: 14 },
});
