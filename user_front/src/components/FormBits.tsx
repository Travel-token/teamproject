import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// ── 폼 라벨 + 인풋 ──
export function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.formLabel, { color: colors.txSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

export function FormInput({ style, ...props }: TextInputProps) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.txPlaceholder}
      style={[
        styles.input,
        { backgroundColor: colors.bgInput, borderColor: colors.bdInput, color: colors.txPrimary },
        style,
      ]}
      {...props}
    />
  );
}

// ── 제출 / 취소 버튼 ──
export function SubmitButton({ label, onPress, disabled }: { label: string; onPress?: () => void; disabled?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.submitBtn, { backgroundColor: colors.bgSubmit, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={styles.submitLabel}>{label}</Text>
    </Pressable>
  );
}

export function CancelButton({ label = '취소', onPress }: { label?: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.cancelBtn, { backgroundColor: colors.bgCancel }]}>
      <Text style={[styles.cancelLabel, { color: colors.txCancel }]}>{label}</Text>
    </Pressable>
  );
}

// ── 멤버 선택 칩 ──
export function MemberChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.bgChipActive : colors.bgCard2,
          borderColor: active ? colors.bgChipActive : colors.bdCard,
        },
      ]}
    >
      <Text style={{ color: active ? '#FFFFFF' : colors.txSecondary, fontSize: 12, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── 세그먼트(분배 방식 등) 칩 ──
export function SegmentChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.segChip,
        {
          backgroundColor: active ? colors.bgChipActive : colors.bgCard2,
        },
      ]}
    >
      <Text style={{ color: active ? '#FFFFFF' : colors.txSecondary, fontSize: 12, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  formLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  submitLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  cancelBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelLabel: { fontSize: 14, fontWeight: '600' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    marginRight: 8,
    marginBottom: 8,
  },
  segChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
});
