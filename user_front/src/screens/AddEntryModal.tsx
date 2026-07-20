import { FontAwesome6 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheetModal from '../components/BottomSheetModal';
import {
  CancelButton,
  FormInput,
  FormRow,
  MemberChip,
  SegmentChip,
  SubmitButton,
} from '../components/FormBits';
import { useTheme } from '../theme/ThemeContext';
import { Member } from '../types';

type SubTab = 'spend' | 'place' | 'transfer';

export default function AddEntryModal({
  visible,
  onClose,
  members,
  initialTab = 'spend',
  onSubmitExpense,
  onSubmitPlace,
  onSubmitTransfer,
}: {
  visible: boolean;
  onClose: () => void;
  members: Member[];
  initialTab?: SubTab;
  onSubmitExpense: (name: string, amount: string, payer: string) => void;
  onSubmitPlace: (name: string) => void;
  onSubmitTransfer: (from: string, to: string, amount: string) => void;
}) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<SubTab>(initialTab);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState(members[0]?.name ?? '나');
  const [activeMembers, setActiveMembers] = useState<string[]>(members.map((m) => m.name));
  const [split, setSplit] = useState<'even' | 'manual' | 'percent'>('even');

  const close = () => {
    setName('');
    setAmount('');
    onClose();
  };

  const toggleMember = (m: string) => {
    setActiveMembers((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  return (
    <BottomSheetModal visible={visible} onClose={close} title="추가">
      <View style={[styles.subTabs, { backgroundColor: colors.bgTab }]}>
        <SubTabBtn label="💳 지출" active={tab === 'spend'} onPress={() => setTab('spend')} />
        <SubTabBtn label="📍 장소" active={tab === 'place'} onPress={() => setTab('place')} />
        <SubTabBtn label="💸 송금" active={tab === 'transfer'} onPress={() => setTab('transfer')} />
      </View>

      {tab === 'spend' && (
        <View>
          <Pressable style={[styles.receiptArea, { borderColor: colors.bdDashed }]}>
            <FontAwesome6 name="camera" size={18} color={colors.txMuted} />
            <Text style={{ fontSize: 12, color: colors.txMuted, marginTop: 6 }}>영수증 사진으로 자동 입력</Text>
          </Pressable>
          <FormRow label="지출 이름">
            <FormInput value={name} onChangeText={setName} placeholder="예: 흑돼지 구이 🥩" />
          </FormRow>
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <FormRow label="금액">
                <FormInput value={amount} onChangeText={setAmount} placeholder="0" keyboardType="number-pad" />
              </FormRow>
            </View>
            <View style={{ flex: 1 }}>
              <FormRow label="결제한 사람">
                <View style={styles.payerRow}>
                  {members.map((m) => (
                    <MemberChip key={m.id} label={m.name} active={payer === m.name} onPress={() => setPayer(m.name)} />
                  ))}
                </View>
              </FormRow>
            </View>
          </View>
          <FormRow label="함께한 멤버">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {members.map((m) => (
                <MemberChip
                  key={m.id}
                  label={m.name}
                  active={activeMembers.includes(m.name)}
                  onPress={() => toggleMember(m.name)}
                />
              ))}
            </View>
          </FormRow>
          <FormRow label="분배">
            <View style={{ flexDirection: 'row' }}>
              <SegmentChip label="균등분할" active={split === 'even'} onPress={() => setSplit('even')} />
              <SegmentChip label="금액 직접입력" active={split === 'manual'} onPress={() => setSplit('manual')} />
              <SegmentChip label="퍼센트" active={split === 'percent'} onPress={() => setSplit('percent')} />
            </View>
          </FormRow>
          <FormRow label="메모">
            <FormInput placeholder="특이사항" />
          </FormRow>
          <SubmitButton
            label="지출 등록"
            onPress={() => {
              onSubmitExpense(name || '새 지출', amount || '0', payer);
              close();
            }}
          />
          <CancelButton onPress={close} />
        </View>
      )}

      {tab === 'place' && (
        <View>
          <FormRow label="장소 이름">
            <FormInput value={name} onChangeText={setName} placeholder="예: 성산일출봉 🌅" />
          </FormRow>
          <FormRow label="함께한 멤버">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {members.map((m) => (
                <MemberChip
                  key={m.id}
                  label={m.name}
                  active={activeMembers.includes(m.name)}
                  onPress={() => toggleMember(m.name)}
                />
              ))}
            </View>
          </FormRow>
          <SubmitButton
            label="장소 추가 (지출내역에 자동 반영)"
            onPress={() => {
              onSubmitPlace(name || '새 장소');
              close();
            }}
          />
          <CancelButton onPress={close} />
        </View>
      )}

      {tab === 'transfer' && (
        <View>
          <FormRow label="보내는 사람">
            <View style={styles.payerRow}>
              {members.map((m) => (
                <MemberChip key={m.id} label={m.name} active={payer === m.name} onPress={() => setPayer(m.name)} />
              ))}
            </View>
          </FormRow>
          <FormRow label="금액">
            <FormInput value={amount} onChangeText={setAmount} placeholder="0" keyboardType="number-pad" />
          </FormRow>
          <SubmitButton
            label="송금 기록 저장"
            onPress={() => {
              onSubmitTransfer(payer, '나', amount || '0');
              close();
            }}
          />
          <CancelButton onPress={close} />
        </View>
      )}
    </BottomSheetModal>
  );
}

function SubTabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.subTabBtn,
        active && {
          backgroundColor: colors.bgCard,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        },
      ]}
    >
      <Text style={{ fontSize: 13, fontWeight: active ? '700' : '500', color: active ? colors.txSecondary : colors.txMuted }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  subTabs: { flexDirection: 'row', padding: 3, borderRadius: 12, marginBottom: 16 },
  subTabBtn: { flex: 1, paddingVertical: 7, borderRadius: 10, alignItems: 'center' },
  receiptArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  row2: { flexDirection: 'row', gap: 12 },
  payerRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
