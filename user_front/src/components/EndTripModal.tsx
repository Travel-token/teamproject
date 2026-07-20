import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';

export default function EndTripModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { colors } = useTheme();
  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="여행을 끝낼까요?">
      <View style={{ alignItems: 'center', paddingHorizontal: 4, paddingBottom: 8 }}>
        <Text style={{ fontSize: 38, marginBottom: 12 }}>🏁</Text>
        <Text style={[styles.desc, { color: colors.txSecondary }]}>
          여행을 끝내면 정산 결과가 확정돼요.{'\n'}
          그리고 방에 공유된 사진과 장소 기록을 바탕으로{'\n'}
          <Text style={{ color: colors.txPrimary, fontWeight: '700' }}>피드에 올릴 내용을 추천</Text>해드려요.
        </Text>
      </View>
      <SubmitButton
        label="여행 끝내기"
        onPress={() => {
          onConfirm();
          onClose();
        }}
      />
      <CancelButton onPress={onClose} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 13, lineHeight: 22, textAlign: 'center' },
});
