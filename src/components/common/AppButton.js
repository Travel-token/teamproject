import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

/**
 * variant:
 *  - primary  → 원본 .btn1 (보라 배경, 흰 텍스트)
 *  - secondary→ 원본 .btn2 (연한 배경, 테두리)
 *  - outline  → 원본 .bo   (투명 배경, 보라 테두리)
 *  - small    → 원본 .bsm  (작은 보조 버튼)
 */
export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
  color, // 위험 동작(삭제 등) 강조용 텍스트 컬러 오버라이드
}) {
  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    variant === 'small' && styles.small,
    disabled && styles.disabled,
    style,
  ];

  const textColor =
    color ||
    (variant === 'primary'
      ? colors.white
      : variant === 'outline'
      ? colors.tp
      : colors.textPrimary);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [...containerStyle, pressed && !disabled && styles.pressed]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            {icon}
            {!!title && (
              <Text
                style={[
                  styles.text,
                  variant === 'small' && styles.smallText,
                  { color: textColor },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.tp,
  },
  secondary: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.tp,
    paddingVertical: 9,
  },
  small: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: fontSize.ml,
    fontWeight: '600',
  },
  smallText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});
