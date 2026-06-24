import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize, spacing } from '../../constants/theme';

export default function ChatBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAI]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={{ fontSize: 14 }}>✨</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.sm },
  rowUser: { justifyContent: 'flex-end' },
  rowAI: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.tpLight,
    alignItems: 'center', justifyContent: 'center',
  },
  bubble: { maxWidth: '78%', borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: spacing.md },
  bubbleAI: { backgroundColor: colors.bgSecondary, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.tp, borderTopRightRadius: 4 },
  text: { fontSize: fontSize.lg, color: colors.textPrimary, lineHeight: 21 },
  textUser: { color: colors.white },
});
