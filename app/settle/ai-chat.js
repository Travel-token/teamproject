import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { AI_QUICK_QUESTIONS, AI_RESPONSES } from '../../src/data/mockData';
import { useTrip } from '../../src/context/TripContext';
import { sendAIChatMessage } from '../../src/api/settleApi';
import TopBar from '../../src/components/common/TopBar';
import ChatBubble from '../../src/components/settle/ChatBubble';

const WELCOME = {
  role: 'ai',
  text: '안녕하세요! 저는 정산을 도와주는 AI 어시스턴트예요 ✨\n\n경주 봄 여행의 지출 내역을 모두 파악하고 있어요. 무엇이 궁금하신가요?',
};

export default function AIChatScreen() {
  const router = useRouter();
  const { activeTrip } = useTrip();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const scrollToEnd = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    scrollToEnd();

    try {
      // 백엔드 연동 지점: Spring Boot의 /api/ai/chat 으로 메시지를 전달합니다.
      const res = await sendAIChatMessage(activeTrip?.id, text);
      const reply = res?.reply || fallbackReply(text);
      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    } catch (e) {
      // 백엔드 미연동 상태에서는 mock 응답으로 대체
      setMessages((prev) => [...prev, { role: 'ai', text: fallbackReply(text) }]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  function fallbackReply(text) {
    const matched = Object.keys(AI_RESPONSES).find((key) => text.includes(key.replace('?', '')) || text.includes(key));
    return (
      AI_RESPONSES[matched] ||
      '좋은 질문이네요! 백엔드 연동 후 실제 지출 데이터를 기반으로 더 정확하게 답변해드릴 수 있어요 😊'
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="AI 정산 어시스턴트" showBack onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={scrollToEnd}
        >
          {messages.map((m, i) => (
            <ChatBubble key={i} role={m.role} text={m.text} />
          ))}
          {loading && <ChatBubble role="ai" text="생각하는 중... 💭" />}

          {messages.length === 1 && (
            <View style={styles.quickWrap}>
              {AI_QUICK_QUESTIONS.map((q) => (
                <Pressable key={q} style={styles.quickBtn} onPress={() => handleSend(q)}>
                  <Text style={styles.quickBtnText}>{q}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="정산에 대해 물어보세요..."
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <Pressable style={styles.sendBtn} onPress={() => handleSend()}>
            <Ionicons name="arrow-up" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.lg },
  quickWrap: { gap: spacing.sm, marginTop: spacing.sm },
  quickBtn: {
    backgroundColor: colors.bgPrimary, borderWidth: 1, borderColor: colors.tpLight,
    borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
  },
  quickBtnText: { fontSize: fontSize.md, color: colors.tpMid, fontWeight: '500' },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderTopWidth: 0.5, borderTopColor: colors.borderTertiary, backgroundColor: colors.bgPrimary,
  },
  input: {
    flex: 1, backgroundColor: colors.bgSecondary, borderRadius: radius.pill,
    paddingVertical: 10, paddingHorizontal: spacing.lg, fontSize: fontSize.lg, color: colors.textPrimary,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.tp,
    alignItems: 'center', justifyContent: 'center',
  },
});
