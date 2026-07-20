import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function RoomMenuDropdown({
  visible,
  onClose,
  onEditTrip,
  onEndTrip,
}: {
  visible: boolean;
  onClose: () => void;
  onEditTrip: () => void;
  onEndTrip: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.dropdown, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}>
          <Pressable
            style={styles.item}
            onPress={() => {
              onClose();
              onEditTrip();
            }}
          >
            <FontAwesome6 name="pen" size={13} color={colors.txPrimary} style={{ width: 16 }} />
            <Text style={[styles.itemText, { color: colors.txPrimary }]}>여행 정보 수정</Text>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.bdCard }]} />
          <Pressable
            style={styles.item}
            onPress={() => {
              onClose();
              onEndTrip();
            }}
          >
            <FontAwesome6 name="flag-checkered" size={13} color={colors.txPrimary} style={{ width: 16 }} />
            <Text style={[styles.itemText, { color: colors.txPrimary }]}>여행 끝내기</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  dropdown: {
    position: 'absolute',
    top: 54,
    right: 16,
    minWidth: 172,
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10 },
  itemText: { fontSize: 13, fontWeight: '600' },
  divider: { height: 0.5, marginVertical: 4, marginHorizontal: 4 },
});
