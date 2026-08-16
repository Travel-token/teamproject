import { FontAwesome6 } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { CancelButton, FormInput, SubmitButton } from './FormBits';
import { useTheme } from '../theme/ThemeContext';

const TRIP_EMOJI_OPTIONS = ['🏝️', '✈️', '🏔️', '🏙️', '🌊', '🎡', '🍜', '🎉'];

export default function TripInfoEditDrawer({
  visible,
  emoji,
  name,
  dateLabel,
  onClose,
  onSave,
}: {
  visible: boolean;
  emoji: string;
  name: string;
  dateLabel: string;
  onClose: () => void;
  onSave: (emoji: string, name: string) => void;
}) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-900)).current;
  const [selectedEmoji, setSelectedEmoji] = useState(emoji);
  const [nameInput, setNameInput] = useState(name);

  useEffect(() => {
    if (visible) {
      setSelectedEmoji(emoji);
      setNameInput(name);
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    } else {
      Animated.timing(translateY, { toValue: -900, duration: 200, useNativeDriver: true }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.drawer, { backgroundColor: colors.bgScreen, transform: [{ translateY }] }]}>
      <View style={styles.head}>
        <Pressable onPress={onClose} hitSlop={8}>
          <FontAwesome6 name="xmark" size={18} color={colors.txPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.txPrimary }]}>여행 정보 수정</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.emojiRow}>
          {TRIP_EMOJI_OPTIONS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setSelectedEmoji(e)}
              style={[styles.emojiOpt, { backgroundColor: e === selectedEmoji ? colors.bgChipActive : colors.bgCard2 }]}
            >
              <Text style={{ fontSize: 20 }}>{e}</Text>
            </Pressable>
          ))}
        </View>
        <FormInput
          value={nameInput}
          onChangeText={setNameInput}
          style={{ textAlign: 'center', fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 12 }}
        />
        <Text style={{ textAlign: 'center', fontSize: 12, color: colors.txMuted }}>
          {dateLabel} (날짜 수정은 데모에서 생략)
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <CancelButton onPress={onClose} />
        </View>
        <View style={{ flex: 1 }}>
          <SubmitButton
            label="저장"
            onPress={() => {
              onSave(selectedEmoji, nameInput.trim() || name);
              onClose();
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drawer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, paddingTop: 50 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 16, fontWeight: '700' },
  body: { paddingHorizontal: 20, alignItems: 'center' },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  emojiOpt: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 'auto', marginBottom: 24 },
});
