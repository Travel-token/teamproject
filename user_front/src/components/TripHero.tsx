import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Trip } from '../types';
import { formatWon } from '../data/mockData';

export default function TripHero({ trip }: { trip: Trip }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.bgHero }]}>
      <Text style={styles.emoji}>{trip.emoji}</Text>
      <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
        <Text style={styles.badgeText}>{trip.status}</Text>
      </View>
      <Text style={styles.name}>{trip.name}</Text>
      <Text style={[styles.date, { color: colors.txHeroSub }]}>{trip.dateLabel}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.txHeroSub }]}>내 지출</Text>
          <Text style={[styles.statVal, { color: colors.txHeroVal }]}>{formatWon(trip.myExpense)}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.txHeroSub }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.txHeroSub }]}>총 지출</Text>
          <Text style={[styles.statVal, { color: colors.txHeroVal }]}>{formatWon(trip.totalExpense)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  emoji: { fontSize: 40, marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginBottom: 6 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  name: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 2 },
  date: { fontSize: 12, marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statLabel: { fontSize: 10, marginBottom: 3 },
  statVal: { fontSize: 16, fontWeight: '700' },
  divider: { width: 0.5, height: 26, opacity: 0.3 },
});
