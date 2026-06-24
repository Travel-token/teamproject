import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

/**
 * TopBar
 * - showBack: 좌측 뒤로가기 버튼 표시 여부 (원본 .tbk)
 * - title: 중앙/좌측 제목 (원본 .ttl)
 * - right: 우측에 들어갈 커스텀 노드 (버튼들)
 */
export default function TopBar({ title, showBack = false, onBack, right, titleAlign = 'left' }) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={styles.bar}>
      {showBack && (
        <Pressable style={styles.iconBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </Pressable>
      )}
      <Text
        style={[styles.title, titleAlign === 'center' && { textAlign: 'center' }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderTertiary,
    backgroundColor: colors.bgPrimary,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
