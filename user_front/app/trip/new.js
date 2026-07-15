import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { CURRENCIES } from '../../src/constants/config';
import TopBar from '../../src/components/common/TopBar';
import FormField from '../../src/components/common/FormField';
import TagButton from '../../src/components/common/TagButton';
import AppButton from '../../src/components/common/AppButton';
import StepDots from '../../src/components/trip/StepDots';
import RangeCalendar from '../../src/components/trip/RangeCalendar';
import Avatar from '../../src/components/common/Avatar';
import { useTrip } from '../../src/context/TripContext';
import { useToast } from '../../src/context/ToastContext';
import { createTrip } from '../../src/api/tripApi';

const TRIP_EMOJIS = ['✈️', '🏖️', '🏔️', '🌸', '🎒', '🚗'];

export default function NewTripScreen() {
  const router = useRouter();
  const { members, setActiveTrip } = useTrip();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✈️');
  const [region, setRegion] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [selectedMembers, setSelectedMembers] = useState([members[0]?.id]);
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('KRW');

  const toggleMember = (id) => {
    if (id === members[0]?.id) return; // 본인은 항상 포함
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canGoStep2 = name.trim().length > 0;
  const canGoStep3 = dateRange.startDate && dateRange.endDate;

  const handleCreate = () => {
    const handleCreate = async () => {
      // async = "이 함수 안에 기다리는 일(서버 통신)이 있어요" 표시
      const nights =
          dateRange.startDate && dateRange.endDate
              ? Math.round(
                  (new Date(dateRange.endDate) - new Date(dateRange.startDate)) /
                  (1000 * 60 * 60 * 24)
              )
              : 0;

      // 서버 저장에 실패해도 화면은 동작하도록, 임시 ID를 먼저 준비
      let savedId = `t${Date.now()}`;

      try {
        // await = 서버의 답장이 올 때까지 여기서 기다림
        // 소포의 키 이름들은 백엔드 Trip_RequestDto의 변수명과 일치해야 함!
        const saved = await createTrip({
          name: name.trim(),
          emoji,
          region: region.trim() || '미지정',
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          budget: Number(budget) || 0,
          currency,
        });
        // 서버가 발급해 준 진짜 방 번호로 교체
        if (saved && saved.tripId) savedId = String(saved.tripId);
      } catch (e) {
        // 서버가 꺼져 있어도 앱이 멈추지 않게: 경고만 띄우고 로컬로 진행
        console.warn('[trip] 서버 저장 실패, 로컬에만 저장합니다:', e?.message);
        toast.show('서버 연결에 실패해 임시로 저장했어요 ⚠️');
      }

      setActiveTrip({
        id: savedId,
        name: name.trim(),
        emoji,
        status: 'ongoing',
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        nights,
        region: region || '미지정',
        members: members.filter((m) => selectedMembers.includes(m.id)),
        placesVisited: 0,
        totalSpent: 0,
        budget: Number(budget) || 0,
        highlightPlaces: [],
      });

      toast.show(`${name.trim()} 여행이 시작됐어요! 🎉`);
      router.replace('/trip');
    };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="새 여행 만들기" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StepDots step={step} total={3} />

        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>여행 이름을 정해주세요</Text>
            <Text style={styles.stepDesc}>여행을 대표하는 이름과 아이콘을 골라보세요</Text>

            <Text style={styles.label}>대표 아이콘</Text>
            <View style={styles.emojiRow}>
              {TRIP_EMOJIS.map((e) => (
                <Pressable
                  key={e}
                  style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
                  onPress={() => setEmoji(e)}
                >
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </Pressable>
              ))}
            </View>

            <FormField
              label="여행 이름"
              required
              placeholder="예: 경주 봄 여행"
              value={name}
              onChangeText={setName}
            />
            <FormField
              label="지역"
              placeholder="예: 경주"
              value={region}
              onChangeText={setRegion}
            />

            <AppButton title="다음" disabled={!canGoStep2} onPress={() => setStep(2)} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>날짜와 멤버를 정해주세요</Text>
            <Text style={styles.stepDesc}>시작일과 종료일을 선택해주세요</Text>

            <RangeCalendar
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={setDateRange}
            />

            <Text style={styles.label}>함께 가는 멤버</Text>
            <View style={styles.memberWrap}>
              {members.map((m) => (
                <Pressable
                  key={m.id}
                  style={[
                    styles.memberChip,
                    selectedMembers.includes(m.id) && styles.memberChipActive,
                  ]}
                  onPress={() => toggleMember(m.id)}
                >
                  <Avatar label={m.short} colorKey={m.color} size="sm" />
                  <Text style={styles.memberChipText}>
                    {m.isMe ? `${m.name} (나)` : m.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.navRow}>
              <AppButton variant="secondary" title="이전" onPress={() => setStep(1)} style={{ flex: 1 }} />
              <AppButton title="다음" disabled={!canGoStep3} onPress={() => setStep(3)} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>예산과 통화를 설정해주세요</Text>
            <Text style={styles.stepDesc}>나중에 언제든 수정할 수 있어요</Text>

            <FormField
              label="예산"
              placeholder="500000"
              keyboardType="number-pad"
              value={budget}
              onChangeText={setBudget}
              style={{ textAlign: 'right' }}
              helperText="입력하지 않으면 예산 제한 없이 진행돼요"
            />

            <Text style={styles.label}>사용 통화</Text>
            <View style={styles.memberWrap}>
              {CURRENCIES.map((c) => (
                <TagButton key={c.code} label={c.label} selected={currency === c.code} onPress={() => setCurrency(c.code)} />
              ))}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {emoji} {name || '(이름 없음)'}
              </Text>
              <Text style={styles.summaryLine}>
                {dateRange.startDate} ~ {dateRange.endDate}
              </Text>
              <Text style={styles.summaryLine}>
                멤버 {selectedMembers.length}명 · {region || '지역 미지정'}
              </Text>
            </View>

            <View style={styles.navRow}>
              <AppButton variant="secondary" title="이전" onPress={() => setStep(2)} style={{ flex: 1 }} />
              <AppButton title="여행 시작하기 🎉" onPress={handleCreate} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scrollContent: { padding: spacing.xl, paddingBottom: 60 },
  stepTitle: { fontSize: fontSize.h2, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  stepDesc: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  label: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.sm },
  emojiRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  emojiBtn: {
    width: 46, height: 46, borderRadius: radius.lg, backgroundColor: colors.bgSecondary,
    borderWidth: 1, borderColor: colors.borderTertiary, alignItems: 'center', justifyContent: 'center',
  },
  emojiBtnActive: { backgroundColor: colors.tpLight, borderColor: colors.tp },
  memberWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  memberChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.borderTertiary, backgroundColor: colors.bgSecondary,
  },
  memberChipActive: { borderColor: colors.tp, backgroundColor: colors.tpLight },
  memberChipText: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: '500' },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  summaryCard: {
    backgroundColor: colors.tpLight, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg,
  },
  summaryTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.tpMid, marginBottom: 6 },
  summaryLine: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: 2 },
})};
