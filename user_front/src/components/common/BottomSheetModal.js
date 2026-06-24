import React from 'react';
import { Modal, View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors, radius, spacing, shadow } from '../../constants/theme';

/**
 * BottomSheetModal
 * 원본 HTML의 .mbd(backdrop) + .msh(sheet) 패턴을 그대로 구현합니다.
 * visible/onClose로 제어하는 단순 패턴 — 화면별 모달들은 이걸 감싸서 사용합니다.
 */
export default function BottomSheetModal({ visible, onClose, children, maxHeightRatio = 0.9 }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { maxHeight: `${maxHeightRatio * 100}%` }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgPrimary,
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    padding: spacing.xl,
    ...shadow.modal,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderSecondary,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
});
