import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import SegmentedTabBar from '../common/SegmentedTabBar';
import FormField from '../common/FormField';
import TagButton from '../common/TagButton';
import AppButton from '../common/AppButton';
import { colors, radius, fontSize, spacing, CATEGORY_META } from '../../constants/theme';
import { EXPENSE_CATEGORIES, SPLIT_TYPES } from '../../constants/config';
import { useTrip } from '../../context/TripContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';

const SPLIT_OPTIONS = [
  { value: SPLIT_TYPES.EQUAL, label: '균등 분할' },
  { value: SPLIT_TYPES.SOLO, label: '내가 전액 부담' },
  { value: SPLIT_TYPES.RATIO, label: '비율 직접 입력' },
];

export default function ExpenseAddModal({ visible, onClose }) {
  const { activeTrip, members, addExpense } = useTrip();
  const toast = useToast();

  const [mode, setMode] = useState('manual'); // manual | ocr
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [category, setCategory] = useState('meal');
  const [payer, setPayer] = useState(members[0]?.id);
  const [splitType, setSplitType] = useState(SPLIT_TYPES.EQUAL);
  const [ratios, setRatios] = useState(() => Object.fromEntries(members.map((m) => [m.id, 0])));
  const [ocrDone, setOcrDone] = useState(false);

  const ratioSum = useMemo(() => Object.values(ratios).reduce((s, v) => s + (Number(v) || 0), 0), [ratios]);

  const resetForm = () => {
    setName('');
    setAmount('');
    setAmountError('');
    setCategory('meal');
    setPayer(members[0]?.id);
    setSplitType(SPLIT_TYPES.EQUAL);
    setOcrDone(false);
    setMode('manual');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      setAmountError('금액을 채워주세요');
      return;
    }
    const meta = CATEGORY_META[category];
    const payerMember = members.find((m) => m.id === payer);
    await addExpense({
      name: name || meta.label,
      amount: Number(amount),
      cat: category,
      emoji: meta.emoji,
      payer: payerMember?.name,
      meta: `${meta.label} · 방금 · ${payerMember?.name} 결제`,
      date: new Date().toISOString().slice(0, 10),
      splitType,
      ratios: splitType === SPLIT_TYPES.RATIO ? ratios : undefined,
    });
    toast.show('지출이 추가되었습니다 ✅');
    handleClose();
  };

  const simulateOCR = () => {
    // 실제로는 영수증 이미지를 백엔드 OCR API(/expenses/ocr)로 전송합니다.
    setTimeout(() => setOcrDone(true), 600);
  };

  const handleOcrConfirm = () => {
    toast.show('OCR 지출이 자동 등록되었습니다!');
    handleClose();
  };

  if (!activeTrip) {
    return (
      <BottomSheetModal visible={visible} onClose={handleClose}>
        <Text style={styles.title}>지출 추가</Text>
        <View style={styles.noTripBox}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>✈️</Text>
          <Text style={styles.noTripTitle}>진행 중인 여행이 없어요</Text>
          <Text style={styles.noTripDesc}>여행을 먼저 만들면{'\n'}지출을 기록할 수 있어요</Text>
          <AppButton
            title="새 여행 만들기"
            onPress={() => {
              handleClose();
              // router.push('/trip/new') 등으로 연결
            }}
            style={{ marginTop: spacing.md, paddingHorizontal: spacing.xl }}
          />
        </View>
      </BottomSheetModal>
    );
  }

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <Text style={styles.title}>지출 추가</Text>

      <SegmentedTabBar
        tabs={[
          { key: 'manual', label: '✏️ 수기 입력' },
          { key: 'ocr', label: '📷 영수증 OCR' },
        ]}
        activeKey={mode}
        onChange={setMode}
      />

      {mode === 'manual' ? (
        <>
          <FormField
            label="장소명"
            placeholder="예: 교동쌈밥"
            value={name}
            onChangeText={setName}
          />
          <FormField
            label="금액"
            required
            placeholder="0"
            keyboardType="number-pad"
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              if (v) setAmountError('');
            }}
            errorText={amountError}
            style={{ textAlign: 'right' }}
          />

          <Text style={styles.label}>카테고리</Text>
          <View style={styles.tagWrap}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <TagButton
                key={cat}
                label={`${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].label}`}
                selected={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </View>

          <Text style={styles.label}>결제자</Text>
          <View style={styles.tagWrap}>
            {members.map((m) => (
              <TagButton
                key={m.id}
                label={m.isMe ? `${m.name} (나)` : m.name}
                selected={payer === m.id}
                onPress={() => setPayer(m.id)}
              />
            ))}
          </View>

          <Text style={styles.label}>분담 방식</Text>
          <View style={[styles.tagWrap, { marginBottom: spacing.md }]}>
            {SPLIT_OPTIONS.map((opt) => (
              <TagButton
                key={opt.value}
                label={opt.label}
                selected={splitType === opt.value}
                onPress={() => setSplitType(opt.value)}
              />
            ))}
          </View>

          {splitType === SPLIT_TYPES.RATIO && (
            <View style={styles.ratioPanel}>
              <View style={styles.ratioHeaderRow}>
                <Text style={styles.ratioHeaderText}>멤버별 비율 입력</Text>
                <Text style={[styles.ratioHeaderText, { fontWeight: '600' }]}>합계: {ratioSum}%</Text>
              </View>
              {members.map((m) => (
                <View key={m.id} style={styles.ratioRow}>
                  <Text style={styles.ratioName}>{m.name}</Text>
                  <FormField
                    keyboardType="number-pad"
                    value={String(ratios[m.id] || '')}
                    onChangeText={(v) => setRatios((prev) => ({ ...prev, [m.id]: Number(v) || 0 }))}
                    containerStyle={{ flex: 1, marginBottom: 0 }}
                    style={{ textAlign: 'right' }}
                  />
                </View>
              ))}
            </View>
          )}

          <AppButton title="지출 추가" onPress={handleSubmit} style={{ marginBottom: spacing.sm }} />
        </>
      ) : (
        <>
          {!ocrDone ? (
            <Pressable style={styles.ocrBox} onPress={simulateOCR}>
              <Ionicons name="camera-outline" size={32} color={colors.tp} style={{ marginBottom: 8 }} />
              <Text style={styles.ocrBoxText}>영수증 촬영 또는 이미지 선택</Text>
            </Pressable>
          ) : (
            <View style={styles.ocrResult}>
              <View style={styles.ocrResultHeader}>
                <Text style={styles.ocrResultHeaderText}>✅ OCR 인식 완료</Text>
                <Text style={styles.confHi}>신뢰도 96%</Text>
              </View>
              <View style={styles.ocrRow}>
                <Text style={styles.ocrRowLabel}>장소명</Text>
                <Text style={styles.ocrRowValue}>황리단길 카페</Text>
              </View>
              <View style={styles.ocrRow}>
                <Text style={styles.ocrRowLabel}>금액</Text>
                <Text style={styles.ocrRowValue}>{formatCurrency(32500)}</Text>
              </View>
              <View style={styles.ocrRow}>
                <Text style={styles.ocrRowLabel}>카테고리</Text>
                <Text style={styles.ocrRowValue}>☕ 카페</Text>
              </View>
              <Text style={styles.ocrHint}>잘못 읽은 항목은 직접 수정해주세요</Text>
            </View>
          )}
          {ocrDone && (
            <AppButton title="자동 등록" onPress={handleOcrConfirm} style={{ marginTop: spacing.md }} />
          )}
        </>
      )}

      <AppButton title="취소" variant="secondary" onPress={handleClose} style={{ marginTop: spacing.sm }} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  label: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: 6 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
  noTripBox: {
    backgroundColor: colors.taLight,
    borderWidth: 0.5,
    borderColor: colors.ta,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  noTripTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  noTripDesc: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  ratioPanel: { backgroundColor: colors.bgSecondary, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  ratioHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  ratioHeaderText: { fontSize: fontSize.base, color: colors.textSecondary },
  ratioRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  ratioName: { fontSize: fontSize.md, color: colors.textPrimary, width: 56 },
  ocrBox: {
    height: 120,
    borderRadius: radius.xl,
    backgroundColor: colors.bgSecondary,
    borderWidth: 2,
    borderColor: colors.borderSecondary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  ocrBoxText: { fontSize: fontSize.lg, fontWeight: '500', color: colors.textSecondary },
  ocrResult: {
    padding: spacing.md,
    backgroundColor: colors.ttLight,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.tt,
  },
  ocrResultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  ocrResultHeaderText: { fontSize: fontSize.base, fontWeight: '600', color: colors.ttMid },
  confHi: { fontSize: fontSize.sm, color: colors.ttMid, fontWeight: '600' },
  ocrRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ocrRowLabel: { fontSize: fontSize.md, color: colors.textSecondary },
  ocrRowValue: { fontSize: fontSize.md, fontWeight: '500', color: colors.textPrimary },
  ocrHint: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.sm },
});
