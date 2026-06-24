import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstWeekday(year, month) {
  return new Date(year, month, 1).getDay();
}
function pad(n) {
  return String(n).padStart(2, '0');
}
function toKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/**
 * RangeCalendar
 * 원본 ntCalPick 로직: 시작일 미선택 → 시작일 선택, 시작일만 선택됨 → 종료일 선택(시작일보다 이전이면 swap),
 * 둘 다 선택됨 → 다시 시작일부터 새로 선택
 */
export default function RangeCalendar({ startDate, endDate, onChange }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);

  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [daysInMonth, firstWeekday]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handlePick = (day) => {
    if (!day) return;
    const key = toKey(year, month, day);
    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: key, endDate: null });
      return;
    }
    // 시작일만 선택된 상태 → 종료일 선택
    if (key < startDate) {
      onChange({ startDate: key, endDate: startDate });
    } else {
      onChange({ startDate, endDate: key });
    }
  };

  const isInRange = (key) => startDate && endDate && key >= startDate && key <= endDate;
  const isEdge = (key) => key === startDate || key === endDate;

  const nights = useMemo(() => {
    if (!startDate || !endDate) return null;
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return diff;
  }, [startDate, endDate]);

  return (
    <View>
      <View style={styles.headerRow}>
        <Pressable style={styles.navBtn} onPress={prevMonth}>
          <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {year}년 {month + 1}월
        </Text>
        <Pressable style={styles.navBtn} onPress={nextMonth}>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (!day) return <View key={idx} style={styles.cell} />;
          const key = toKey(year, month, day);
          const edge = isEdge(key);
          const inRange = isInRange(key);
          return (
            <Pressable key={idx} style={styles.cell} onPress={() => handlePick(day)}>
              <View style={[styles.dayCircle, edge && styles.dayEdge, inRange && !edge && styles.dayInRange]}>
                <Text style={[styles.dayText, (edge || inRange) && styles.dayTextActive]}>{day}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>📅 시작일</Text>
          <Text style={styles.summaryValue}>{startDate || '선택 안 됨'}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>📅 종료일</Text>
          <Text style={styles.summaryValue}>{endDate || '선택 안 됨'}</Text>
        </View>
        <View style={styles.nightsBox}>
          <Text style={styles.nightsLabel}>기간</Text>
          <Text style={styles.nightsValue}>{nights != null ? `${nights}박` : '-'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  navBtn: {
    width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.bgSecondary,
    borderWidth: 0.5, borderColor: colors.borderTertiary, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: { flex: 1, textAlign: 'center', fontSize: fontSize.sm, color: colors.textTertiary, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayEdge: { backgroundColor: colors.tp },
  dayInRange: { backgroundColor: colors.tpLight },
  dayText: { fontSize: fontSize.md, color: colors.textPrimary },
  dayTextActive: { color: colors.white, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.lg },
  summaryBox: {
    flex: 1, backgroundColor: colors.bgSecondary, borderRadius: radius.md, padding: 10,
    borderWidth: 0.5, borderColor: colors.borderTertiary, alignItems: 'center',
  },
  summaryLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: '500', marginBottom: 3 },
  summaryValue: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  arrow: { fontSize: fontSize.xl, color: colors.textTertiary, alignSelf: 'center' },
  nightsBox: { backgroundColor: colors.tpLight, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center', minWidth: 50, justifyContent: 'center' },
  nightsLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  nightsValue: { fontSize: fontSize.lg, fontWeight: '700', color: colors.tp },
});
