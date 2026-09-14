import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Trip } from '../types';
import { formatMoney } from '../utils/format';
export default function TripHero({ trip }: {
    trip: Trip;
}) {
    const { colors } = useTheme();
    return (<View style={[styles.wrap, { backgroundColor: colors.bgHero }]}>
      <Text style={styles.emoji}>{trip.emoji}</Text>
      <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
        <Text style={styles.badgeText}>{trip.status}</Text>
      </View>
      <Text style={styles.name}>{trip.name}</Text>
      <Text style={[styles.date, { color: colors.txHeroSub }]}>{trip.dateLabel}</Text>
      {trip.members.length > 0 && <View style={styles.membersRow}>
        {trip.members.slice(0, 5).map(member => <View key={member.id} style={styles.memberChip}>
          <Text style={styles.memberAvatar}>{(member.name || '멤버').slice(0, 2)}</Text>
          <Text style={styles.memberName} numberOfLines={1}>{member.name || '멤버'}</Text>
        </View>)}
        {trip.members.length > 5 && <Text style={styles.moreMembers}>+{trip.members.length - 5}</Text>}
      </View>}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.txHeroSub }]}>내 지출</Text>
          <Text style={[styles.statVal, { color: colors.txHeroVal }]}>{formatMoney(trip.myExpense, trip.currency)}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.txHeroSub }]}/>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.txHeroSub }]}>총 지출</Text>
          <Text style={[styles.statVal, { color: colors.txHeroVal }]}>{formatMoney(trip.totalExpense, trip.currency)}</Text>
        </View>
      </View>
    </View>);
}
const styles = StyleSheet.create({
    wrap: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20 },
    emoji: { fontSize: 40, marginBottom: 8 },
    badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginBottom: 6 },
    badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
    name: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 2 },
    date: { fontSize: 12, marginBottom: 14 },
    membersRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 14 },
    memberChip: { flexDirection: 'row', alignItems: 'center', maxWidth: 100, paddingVertical: 4, paddingLeft: 4, paddingRight: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.16)' },
    memberAvatar: { width: 22, height: 22, borderRadius: 11, textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.22)', color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
    memberName: { marginLeft: 5, color: '#FFFFFF', fontSize: 11, flexShrink: 1 },
    moreMembers: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    statsRow: { flexDirection: 'row', alignItems: 'center' },
    statItem: { alignItems: 'center', paddingHorizontal: 20 },
    statLabel: { fontSize: 10, marginBottom: 3 },
    statVal: { fontSize: 16, fontWeight: '700' },
    divider: { width: 0.5, height: 26, opacity: 0.3 },
});
