import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

export default function FormField({
  label,
  required = false,
  helperText,
  errorText,
  containerStyle,
  ...textInputProps
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.fieldGroup, containerStyle]}>
      {!!label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TextInput
        placeholderTextColor={colors.textTertiary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && styles.inputFocused,
          textInputProps.style,
        ]}
        {...textInputProps}
      />
      {!!helperText && !errorText && <Text style={styles.helper}>{helperText}</Text>}
      {!!errorText && <Text style={styles.error}>💬 {errorText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.tc,
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.borderSecondary,
    backgroundColor: colors.bgSecondary,
    color: colors.textPrimary,
    fontSize: fontSize.lg,
  },
  inputFocused: {
    borderColor: colors.tp,
    backgroundColor: colors.bgPrimary,
  },
  helper: {
    fontSize: fontSize.base,
    color: colors.textTertiary,
    marginTop: 4,
  },
  error: {
    fontSize: fontSize.base,
    color: colors.tc,
    marginTop: 4,
  },
});
