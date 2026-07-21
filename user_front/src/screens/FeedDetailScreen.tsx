import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FeedDetail'>;

interface Comment {
  id: string;
  author: string;
  text: string;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: 'c1', author: '지수', text: '우와 진짜 예쁘다 ㅠㅠ' },
  { id: 'c2', author: '민호', text: '다음엔 나도 같이 가자!' },
  { id: 'c3', author: '세린', text: '일출 실화냐 대박' },
];

export default function FeedDetailScreen({ route, navigation }: Props) {
  const { post } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [input, setInput] = useState('');

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const addComment = () => {
    if (!input.trim()) return;
    setComments((prev) => [...prev, { id: `c${Date.now()}`, author: '나', text: input.trim() }]);
    setInput('');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome6 name="chevron-left" size={16} color={colors.txPrimary} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.txPrimary }]}>피드</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={
          <View>
            <View style={[styles.hero, { backgroundColor: colors.bgCollage[0] }]}>
              <Text style={styles.heroEmoji}>{post.emoji}</Text>
            </View>
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <View style={styles.authorRow}>
                <Avatar label="나" size={34} />
                <View style={{ marginLeft: 9, flex: 1 }}>
                  <Text style={[styles.authorName, { color: colors.txPrimary }]}>김여행</Text>
                  <Text style={[styles.authorDate, { color: colors.txMuted }]}>
                    {post.date.replace(/-/g, '.')}
                  </Text>
                </View>
                <View style={[styles.tagPill, { backgroundColor: colors.bgCard2 }]}>
                  <Text style={{ fontSize: 10, color: colors.txMuted }}>{post.place}</Text>
                </View>
              </View>
              <Text style={[styles.caption, { color: colors.txPrimary }]}>{post.caption}</Text>
              <View style={[styles.statsRow, { borderColor: colors.bdCard }]}>
                <Pressable onPress={toggleLike} style={styles.statBtn}>
                  <FontAwesome6
                    name="heart"
                    size={16}
                    color={liked ? colors.bgDel : colors.txMuted}
                    solid={liked}
                  />
                  <Text style={[styles.statText, { color: colors.txMuted }]}>{likeCount}</Text>
                </Pressable>
                <View style={styles.statBtn}>
                  <FontAwesome6 name="comment" size={15} color={colors.txMuted} />
                  <Text style={[styles.statText, { color: colors.txMuted }]}>{comments.length}</Text>
                </View>
              </View>
              <Text style={[styles.commentHd, { color: colors.txPrimary }]}>댓글 {comments.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <Avatar label={item.author.slice(0, 1)} size={28} />
            <View style={{ marginLeft: 9, flex: 1 }}>
              <Text style={[styles.commentAuthor, { color: colors.txPrimary }]}>{item.author}</Text>
              <Text style={[styles.commentText, { color: colors.txSecondary }]}>{item.text}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}
      />

      <View style={[styles.inputBar, { borderColor: colors.bdCard, backgroundColor: colors.bgScreen }]}>
        <Avatar label="나" size={28} />
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="댓글을 입력하세요"
          placeholderTextColor={colors.txPlaceholder}
          style={[styles.commentInput, { backgroundColor: colors.bgInput, color: colors.txPrimary }]}
          onSubmitEditing={addComment}
        />
        <Pressable onPress={addComment} style={[styles.sendBtn, { backgroundColor: colors.bgWrite }]}>
          <FontAwesome6 name="paper-plane" size={13} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  backBtn: { marginRight: 10 },
  topTitle: { fontSize: 16, fontWeight: '700', marginLeft: 4 },
  hero: { height: 240, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 60 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorName: { fontSize: 13, fontWeight: '700' },
  authorDate: { fontSize: 10, marginTop: 2 },
  tagPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  caption: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 11,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    marginBottom: 16,
  },
  statBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, fontWeight: '600' },
  commentHd: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start' },
  commentAuthor: { fontSize: 12, fontWeight: '700' },
  commentText: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0.5,
  },
  commentInput: { flex: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13 },
  sendBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
