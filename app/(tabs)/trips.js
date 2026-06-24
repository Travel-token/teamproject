import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { useTrip } from '../../src/context/TripContext';
import TripListCard from '../../src/components/trip/TripListCard';
import RouteShareModal from '../../src/components/modals/RouteShareModal';
import TripManageModal from '../../src/components/modals/TripManageModal';

export default function TripsScreen() {
  const router = useRouter();
  const { activeTrip, pastTrips, savedTrips, toggleSavedTrip } = useTrip();
  const [savedPanelOpen, setSavedPanelOpen] = useState(false);
  const [routeShareVisible, setRouteShareVisible] = useState(false);
  const [manageVisible, setManageVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>여행기록</Text>
        <Pressable style={styles.headerBtn} onPress={() => setSavedPanelOpen((v) => !v)}>
          <Ionicons name="archive-outline" size={14} color={colors.textPrimary} />
          <Text style={styles.headerBtnText}>저장된 여행</Text>
        </Pressable>
        <Pressable style={styles.headerBtn} onPress={() => router.push('/trip/new')}>
          <Ionicons name="airplane-outline" size={14} color={colors.textPrimary} />
          <Text style={styles.headerBtnText}>새 여행</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTrip && (
          <>
            <Text style={styles.sectionLabel}>진행 중</Text>
            <TripListCard
              trip={{
                ...activeTrip,
                memberCount: activeTrip.members?.length,
              }}
              onPress={() => router.push('/trip')}
              onShareRoute={() => setRouteShareVisible(true)}
              onManage={() => setManageVisible(true)}
            />
          </>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>종료된 여행</Text>
        </View>

        {pastTrips.map((trip) => (
          <View key={trip.id}>
            <TripListCard trip={trip} compact onPress={() => router.push(`/trip/past/${trip.id}`)} />
            <Pressable style={styles.archiveLink} onPress={() => toggleSavedTrip(trip)}>
              <Text style={styles.archiveLinkText}>저장하기 →</Text>
            </Pressable>
          </View>
        ))}

        {savedPanelOpen && (
          <View style={styles.savedPanel}>
            <View style={styles.divider} />
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>📦 저장된 여행</Text>
              <Pressable onPress={() => setSavedPanelOpen(false)}>
                <Text style={styles.closeLink}>닫기 ×</Text>
              </Pressable>
            </View>
            {savedTrips.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 24, marginBottom: 8 }}>📦</Text>
                <Text style={styles.emptyTitle}>저장된 여행이 없어요</Text>
                <Text style={styles.emptyDesc}>종료된 여행을 저장하면 여기에 표시됩니다</Text>
              </View>
            ) : (
              savedTrips.map((trip) => <TripListCard key={trip.id} trip={trip} compact />)
            )}
          </View>
        )}
      </ScrollView>

      <RouteShareModal visible={routeShareVisible} onClose={() => setRouteShareVisible(false)} trip={activeTrip} />
      <TripManageModal visible={manageVisible} onClose={() => setManageVisible(false)} trip={activeTrip} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderTertiary,
  },
  title: { fontSize: fontSize.title, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgSecondary,
    borderWidth: 0.5,
    borderColor: colors.borderTertiary,
    borderRadius: radius.sm,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  headerBtnText: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: '500' },
  scrollContent: { padding: spacing.xl, paddingBottom: 110 },
  sectionLabel: { fontSize: fontSize.base, fontWeight: '500', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.sm },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, marginBottom: 4 },
  archiveLink: { alignSelf: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.sm },
  archiveLinkText: { fontSize: fontSize.base, color: colors.textSecondary },
  divider: { height: 0.5, backgroundColor: colors.borderTertiary, marginVertical: spacing.md },
  closeLink: { fontSize: fontSize.sm, color: colors.textSecondary },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgSecondary,
    borderRadius: radius.xl,
    borderWidth: 0.5,
    borderColor: colors.borderSecondary,
    borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: fontSize.md, fontWeight: '500', color: colors.textSecondary },
  emptyDesc: { fontSize: fontSize.base, color: colors.textTertiary, marginTop: 4, textAlign: 'center' },
  savedPanel: {},
});
