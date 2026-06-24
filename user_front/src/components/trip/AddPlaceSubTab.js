import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FormField from '../common/FormField';
import TagButton from '../common/TagButton';
import AppButton from '../common/AppButton';
import { colors, fontSize, spacing } from '../../constants/theme';
import { useTrip } from '../../context/TripContext';
import { useToast } from '../../context/ToastContext';

export default function AddPlaceSubTab({ onDone }) {
  const { members, addPlaceToLog } = useTrip();
  const toast = useToast();
  const [name, setName] = useState('');
  const [time, setTime] = useState('14:00');
  const [memo, setMemo] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(() => members.map((m) => m.id));

  const toggleMember = (id) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.show('장소명을 입력해주세요');
      return;
    }
    addPlaceToLog({
      name: name.trim(),
      time: `${time}${memo ? ' · ' + memo : ''}`,
      tagLabels: ['장소추가'],
    });
    toast.show(`${name.trim()} 동선에 추가됐어요! 📍`);
    setName('');
    setMemo('');
    onDone?.();
  };

  return (
    <View>
      <Text style={styles.desc}>지출 없이 방문한 장소를 기록해요</Text>

      <FormField label="장소명" required placeholder="예: 황리단길" value={name} onChangeText={setName} />
      <FormField label="시간" placeholder="14:00" value={time} onChangeText={setTime} />

      <Text style={styles.label}>함께한 사람</Text>
      <View style={styles.memberWrap}>
        {members.map((m) => (
          <TagButton
            key={m.id}
            label={m.name}
            selected={selectedMembers.includes(m.id)}
            onPress={() => toggleMember(m.id)}
          />
        ))}
      </View>

      <FormField label="메모" placeholder="특이사항 메모" value={memo} onChangeText={setMemo} />

      <AppButton title="동선에 추가" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.md },
  label: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: 6 },
  memberWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md },
});
