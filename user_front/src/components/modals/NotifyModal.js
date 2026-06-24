import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import AppButton from '../common/AppButton';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { useTrip } from '../../context/TripContext';
import { useToast } from '../../context/ToastContext';

const TYPE_ICON = {
  gps: { name: 'location-outline', color: colors.tt, bg: colors.ttLight },
  settle: { name: 'cash-outline', color: colors.tp, bg: colors.tpLight },
};

export default function NotifyModal({ visible, onClose }) {
  const { notifications, deleteNotification, clearAllNotifications } = useTrip();
  const toast = useToast();

  const handleClearAll = () => {
    if (!notifications.length) {
      onClose();
      return;
    }
    clearAllNotifications();
    toast.show('알림을 모두 지웠어요');
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>알림</Text>
        <Pressable onPress={handleClearAll}>
          <Text style={styles.clearAll}>전체 지우기</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>새로운 알림이 없어요</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const meta = TYPE_ICON[n.type] || TYPE_ICON.gps;
            return (
              <View key={n.id} style={styles.item}>
                <View style={[styles.itemIcon, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.name} size={16} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{n.title}</Text>
                  <Text style={styles.itemBody}>{n.body}</Text>
                </View>
                <Pressable onPress={() => deleteNotification(n.id)}>
                  <Ionicons name="close" size={16} color={colors.textTertiary} />
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      <AppButton title="닫기" variant="secondary" onPress={onClose} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.textPrimary },
  clearAll: { fontSize: fontSize.md, color: colors.tc, fontWeight: '500' },
  list: { gap: spacing.md, marginBottom: spacing.xl },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.lg,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  itemBody: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 2 },
  empty: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.md, color: colors.textTertiary },
});
