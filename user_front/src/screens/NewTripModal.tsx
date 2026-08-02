import { FontAwesome6 } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import BottomSheetModal from '../components/BottomSheetModal';
import { CancelButton, FormInput, FormRow, SubmitButton } from '../components/FormBits';
import { useTheme } from '../theme/ThemeContext';

const EMOJIS = ['🏝️', '🏙️', '⛰️', '🌊', '🏯', '🎡', '🚗', '✈️'];
const CURRENCIES = ['KRW', 'USD', 'JPY', 'EUR'];

// yyyy-MM-dd 사이의 모든 날짜 문자열을 반환 (react-native-calendars markedDates용)
function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
  }
  return dates;
}

export default function NewTripModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, region: string) => void;
}) {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [members, setMembers] = useState<string[]>(['나']);
  const [memberInput, setMemberInput] = useState('');
  const [currency, setCurrency] = useState('KRW');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const reset = () => {
    setStep(1);
    setName('');
    setRegion('');
    setEmoji(EMOJIS[0]);
    setMembers(['나']);
    setMemberInput('');
    setCurrency('KRW');
    setStartDate(null);
    setEndDate(null);
  };

  const onDayPress = (day: DateData) => {
    // 시작일이 없거나, 이미 범위가 정해진 상태에서 다시 누르면 새로 시작
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
    } else if (day.dateString < startDate) {
      // 시작일보다 이른 날짜를 누르면 시작일을 갱신
      setStartDate(day.dateString);
    } else {
      setEndDate(day.dateString);
    }
  };

  const markedDates = useMemo(() => {
    if (!startDate) return {};
    if (!endDate) {
      return { [startDate]: { startingDay: true, endingDay: true, color: colors.bgChipActive, textColor: '#FFF' } };
    }
    const range = getDatesInRange(startDate, endDate);
    const marks: Record<string, any> = {};
    range.forEach((d, i) => {
      marks[d] = {
        color: colors.bgChipActive,
        textColor: '#FFF',
        startingDay: i === 0,
        endingDay: i === range.length - 1,
      };
    });
    return marks;
  }, [startDate, endDate, colors.bgChipActive]);

  const dateRangeLabel = !startDate
    ? '시작일과 종료일을 선택하세요'
    : !endDate
    ? `${startDate} (종료일을 선택하세요)`
    : `${startDate} ~ ${endDate}`;

  const close = () => {
    reset();
    onClose();
  };

  const addMember = () => {
    if (!memberInput.trim()) return;
    setMembers((prev) => [...prev, memberInput.trim()]);
    setMemberInput('');
  };

  const create = () => {
    onCreate(name || '새 여행', region || '미정');
    close();
  };

  return (
    <BottomSheetModal visible={visible} onClose={close} title="새 여행 만들기" maxHeightPct={92}>
      <View style={styles.dots}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.dot,
              { backgroundColor: s <= step ? colors.bgChipActive : colors.bdCard },
            ]}
          />
        ))}
      </View>

      {step === 1 && (
        <View>
          <FormRow label="여행 이름">
            <FormInput value={name} onChangeText={setName} placeholder="예: 제주도 여름 여행" />
          </FormRow>
          <FormRow label="지역">
            <FormInput value={region} onChangeText={setRegion} placeholder="예: 제주도" />
          </FormRow>
          <FormRow label="아이콘 설정">
            <View style={styles.emojiGrid}>
              {EMOJIS.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setEmoji(e)}
                  style={[
                    styles.emojiCell,
                    {
                      backgroundColor: e === emoji ? colors.bgChipActive : colors.bgCard2,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </FormRow>
          <SubmitButton label="다음" onPress={() => setStep(2)} />
        </View>
      )}

      {step === 2 && (
        <View>
          <FormRow label="여행 날짜">
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.txSecondary, marginBottom: 10 }}>
              {dateRangeLabel}
            </Text>
            <View style={[styles.calWrap, { borderColor: colors.bdCard }]}>
              <Calendar
                onDayPress={onDayPress}
                markingType="period"
                markedDates={markedDates}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: colors.txMuted,
                  dayTextColor: colors.txPrimary,
                  monthTextColor: colors.txPrimary,
                  todayTextColor: colors.bgChipActive,
                  arrowColor: colors.txPrimary,
                  textDisabledColor: colors.txPlaceholder,
                }}
                style={{ borderRadius: 14 }}
              />
            </View>
          </FormRow>
          <FormRow label="멤버 추가">
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <FormInput
                  value={memberInput}
                  onChangeText={setMemberInput}
                  placeholder="이름 입력 후 추가"
                  onSubmitEditing={addMember}
                />
              </View>
              <Pressable onPress={addMember} style={[styles.addBtn, { backgroundColor: colors.bgWrite }]}>
                <FontAwesome6 name="plus" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.emojiGrid}>
              {members.map((m, i) => (
                <View key={`${m}-${i}`} style={[styles.memberChip, { backgroundColor: colors.bgCard2 }]}>
                  <Text style={{ fontSize: 12, color: colors.txSecondary, fontWeight: '600' }}>{m}</Text>
                </View>
              ))}
            </View>
          </FormRow>
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <CancelButton label="이전" onPress={() => setStep(1)} />
            </View>
            <View style={{ flex: 1 }}>
              <SubmitButton label="다음" onPress={() => setStep(3)} />
            </View>
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <FormRow label="통화 설정">
            <View style={styles.emojiGrid}>
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCurrency(c)}
                  style={[
                    styles.currencyChip,
                    { backgroundColor: c === currency ? colors.bgChipActive : colors.bgCard2 },
                  ]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: c === currency ? '#FFF' : colors.txSecondary }}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </FormRow>
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <CancelButton label="이전" onPress={() => setStep(2)} />
            </View>
            <View style={{ flex: 1 }}>
              <SubmitButton label="여행 만들기" onPress={create} />
            </View>
          </View>
        </View>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 18 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiCell: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  memberChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  currencyChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  row2: { flexDirection: 'row', gap: 8, marginTop: 4 },
  calWrap: { borderWidth: 0.5, borderRadius: 14, overflow: 'hidden', paddingVertical: 4 },
});
