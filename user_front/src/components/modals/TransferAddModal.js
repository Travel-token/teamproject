import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import FormField from '../common/FormField';
import TagButton from '../common/TagButton';
import AppButton from '../common/AppButton';
import { colors, fontSize, spacing } from '../../constants/theme';
import { useTrip } from '../../context/TripContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/format';

export default function TransferAddModal({ visible, onClose }) {
  const { members, addTransfer } = useTrip();
  const toast = useToast();
  const [fromId, setFromId] = useState(members[0]?.id);
  const [toId, setToId] = useState(members[1]?.id);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [amountError, setAmountError] = useState('');

  const resetForm = () => {
    setFromId(members[0]?.id);
    setToId(members[1]?.id);
    setAmount('');
    setMemo('');
    setAmountError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      setAmountError('금액을 입력해주세요');
      return;
    }
    if (fromId === toId) {
      toast.show('보내는 사람과 받는 사람이 같을 수 없어요');
      return;
    }

    const from = members.find((m) => m.id === fromId);
    const to = members.find((m) => m.id === toId);

    await addTransfer({
      fromId,
      toId,
      fromName: from?.isMe ? `${from.name} (나)` : from?.name,
      toName: to?.isMe ? `${to.name} (나)` : to?.name,
      amount: Number(amount),
      memo,
      timeLabel: '방금',
    });

    toast.show(`${from?.name} → ${to?.name} ${formatCurrency(Number(amount))} 송금 기록 저장 ✅`);
    handleClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose}>
      <Text style={styles.title}>송금 기록 추가</Text>
      <Text style={styles.desc}>멤버 간 송금 내역을 기록해요</Text>

      <Text style={styles.label}>보내는 사람</Text>
      <View style={styles.memberWrap}>
        {members.map((m) => (
          <TagButton
            key={m.id}
            label={m.isMe ? `${m.name} (나)` : m.name}
            selected={fromId === m.id}
            onPress={() => setFromId(m.id)}
          />
        ))}
      </View>

      <Text style={styles.label}>받는 사람</Text>
      <View style={styles.memberWrap}>
        {members.map((m) => (
          <TagButton
            key={m.id}
            label={m.isMe ? `${m.name} (나)` : m.name}
            selected={toId === m.id}
            onPress={() => setToId(m.id)}
          />
        ))}
      </View>

      <FormField
        label="금액"
        required
        keyboardType="number-pad"
        placeholder="0"
        value={amount}
        onChangeText={(v) => {
          setAmount(v);
          if (v) setAmountError('');
        }}
        errorText={amountError}
        style={{ textAlign: 'right' }}
      />
      <FormField label="메모" placeholder="예: 카카오페이로 송금" value={memo} onChangeText={setMemo} />

      <AppButton title="송금 기록 저장" onPress={handleSubmit} style={{ marginBottom: spacing.sm }} />
      <AppButton title="취소" variant="secondary" onPress={handleClose} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  desc: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
  label: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: 6 },
  memberWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
});