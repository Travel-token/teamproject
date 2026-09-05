import ApiImage from '../components/ApiImage';
import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { createComment, fetchComments } from '@/api/comment';
import { fetchFeed, likeFeed, unlikeFeed } from '@/api/feed';
import { fetchMyProfile } from '@/api/mypage';
import { useToast } from '../components/Toast';
import { apiError } from '../utils/apiError';
type Props = NativeStackScreenProps<RootStackParamList, 'FeedDetail'>;
interface Comment {
    id: string;
    author: string;
    text: string;
}
export default function FeedDetailScreen({ route, navigation }: Props) {
    const [post, setPost] = useState(route.params.post);
    const { showToast } = useToast();
    const [savingLike, setSavingLike] = useState(false);
    const [savingComment, setSavingComment] = useState(false);
    useEffect(() => {
        let alive = true;
        fetchFeed(route.params.post.id).then(f => {
            if (!alive)
                return;
            setPost({ ...route.params.post, caption: f.caption, authorName: f.authorName || '알 수 없는 사용자', likes: f.likeCount, views: f.viewCount, likedByMe: f.likedByMe, photoUrls: f.photoUrls });
            setLiked(f.likedByMe);
            setLikeCount(f.likeCount);
        }).catch(e => showToast(apiError(e))).finally(() => { });
        return () => { alive = false; };
    }, [route.params.post.id]);
    const [myUserId, setMyUserId] = useState<number | null>(null);
    useEffect(() => {
        fetchMyProfile()
            .then((profile) => setMyUserId(profile.id))
            .catch(() => setMyUserId(null));
    }, []);
    useEffect(() => {
        let alive = true;
        fetchComments(String(post.id))
            .then((items) => {
            if (!alive)
                return;
            setComments(items.map((item) => ({
                id: item.id,
                author: item.authorName,
                text: item.content,
            })));
        })
            .catch(() => {
            if (alive)
                setComments([]);
        });
        return () => {
            alive = false;
        };
    }, [post.id]);
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [liked, setLiked] = useState(post.likedByMe);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [comments, setComments] = useState<Comment[]>([]);
    const [input, setInput] = useState('');
    const toggleLike = async () => {
        if (myUserId === null || savingLike)
            return;
        setSavingLike(true);
        const nextLiked = !liked;
        try {
            if (nextLiked) {
                await likeFeed(post.id, myUserId);
            }
            else {
                await unlikeFeed(post.id, myUserId);
            }
            setLiked(nextLiked);
            setLikeCount((count) => count + (nextLiked ? 1 : -1));
        }
        catch (e) {
            showToast(apiError(e));
        }
        finally {
            setSavingLike(false);
        }
    };
    const addComment = async () => {
        const content = input.trim();
        if (!content || savingComment)
            return;
        setSavingComment(true);
        try {
            const created = await createComment(post.id, content);
            setComments((prev) => [
                ...prev,
                {
                    id: created.id,
                    author: created.authorName,
                    text: created.content,
                },
            ]);
            setInput('');
        }
        catch (e) {
            showToast(apiError(e));
        }
        finally {
            setSavingComment(false);
        }
    };
    return (<View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome6 name="chevron-left" size={16} color={colors.txPrimary}/>
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.txPrimary }]}>피드</Text>
      </View>

      <FlatList data={comments} keyExtractor={(c) => c.id} ListHeaderComponent={<View>
            <View style={[styles.hero, { backgroundColor: colors.bgCollage[0] }]}>
              {post.photoUrls?.[0] ? <ApiImage uri={post.photoUrls[0]} style={{ width: "100%", height: 240 }}/> : <Text style={styles.heroEmoji}>{post.emoji}</Text>}
            </View>
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
              <View style={styles.authorRow}>
                <Avatar label={post.authorName.slice(0, 1)} size={34}/>
                <View style={{ marginLeft: 9, flex: 1 }}>
                  <Text style={[styles.authorName, { color: colors.txPrimary }]}>{post.authorName}</Text>
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
                  <FontAwesome6 name="heart" size={16} color={liked ? colors.bgDel : colors.txMuted} solid={liked}/>
                  <Text style={[styles.statText, { color: colors.txMuted }]}>{likeCount}</Text>
                </Pressable>
                <View style={styles.statBtn}>
                  <FontAwesome6 name="comment" size={15} color={colors.txMuted}/>
                  <Text style={[styles.statText, { color: colors.txMuted }]}>{comments.length}</Text>
                </View>
              </View>
              <Text style={[styles.commentHd, { color: colors.txPrimary }]}>댓글 {comments.length}</Text>
            </View>
          </View>} renderItem={({ item }) => (<View style={styles.commentRow}>
            <Avatar label={item.author.slice(0, 1)} size={28}/>
            <View style={{ marginLeft: 9, flex: 1 }}>
              <Text style={[styles.commentAuthor, { color: colors.txPrimary }]}>{item.author}</Text>
              <Text style={[styles.commentText, { color: colors.txSecondary }]}>{item.text}</Text>
            </View>
          </View>)} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}/>

      <View style={[styles.inputBar, { borderColor: colors.bdCard, backgroundColor: colors.bgScreen }]}>
        <Avatar label="나" size={28}/>
        <TextInput value={input} onChangeText={setInput} placeholder="댓글을 입력하세요" placeholderTextColor={colors.txPlaceholder} style={[styles.commentInput, { backgroundColor: colors.bgInput, color: colors.txPrimary }]} onSubmitEditing={addComment}/>
        <Pressable onPress={addComment} style={[styles.sendBtn, { backgroundColor: colors.bgWrite }]}>
          <FontAwesome6 name="paper-plane" size={13} color="#FFFFFF"/>
        </Pressable>
      </View>
    </View>);
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
