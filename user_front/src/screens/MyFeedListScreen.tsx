import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteMyFeed, fetchMyFeeds, MyFeedItem } from '../api/mypage';
import ApiImage from '../components/ApiImage';
import { SubmitButton } from '../components/FormBits';
import { useToast } from '../components/Toast';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { apiError } from '../utils/apiError';

type Props = NativeStackScreenProps<RootStackParamList, 'MyFeedList'>;

export default function MyFeedListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [feeds, setFeeds] = useState<MyFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const transitionLock = useRef(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    transitionLock.current = false;
    setTransitioning(false);
    setLoading(true);
    void fetchMyFeeds()
      .then(items => { if (active) setFeeds(items); })
      .catch(error => { if (active) showToast(apiError(error, '내 피드를 불러오지 못했어요.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [showToast]));

  const navigateOnce = (action: () => void) => {
    if (transitionLock.current) return;
    transitionLock.current = true;
    setTransitioning(true);
    action();
  };

  const remove = (feed: MyFeedItem) => {
    Alert.alert('피드를 삭제할까요?', undefined, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        try {
          await deleteMyFeed(feed.id);
          setFeeds(current => current.filter(item => item.id !== feed.id));
          showToast('피드를 삭제했어요.');
        } catch (error) {
          showToast(apiError(error, '피드를 삭제하지 못했어요.'));
        }
      } },
    ]);
  };

  return <View style={[styles.screen, { backgroundColor: colors.bgScreen, paddingTop: insets.top }]}>
    <View style={[styles.header, { borderBottomColor: colors.bdCard }]}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="내 피드 닫기">
        <FontAwesome6 name="chevron-left" size={17} color={colors.txPrimary} />
      </Pressable>
      <Text style={[styles.title, { color: colors.txPrimary }]}>내 피드</Text>
      <View style={styles.headerSpacer} />
    </View>
    {loading ? <ActivityIndicator style={styles.loading} color={colors.txPrimary} /> :
      <ScrollView contentContainerStyle={styles.content}>
        {feeds.length === 0 && <Text style={[styles.empty, { color: colors.txMuted }]}>아직 등록한 피드가 없어요.</Text>}
        {feeds.map(feed => <View key={feed.id} style={[styles.row, { backgroundColor: colors.bgCard2 }]}>
          <View style={[styles.thumb, { backgroundColor: colors.bgCollage[0] }]}>
            {feed.photoUrls[0] ? <ApiImage uri={feed.photoUrls[0]} style={styles.image} /> : <Text style={styles.camera}>📷</Text>}
          </View>
          <View style={styles.info}>
            <Text style={[styles.caption, { color: colors.txPrimary }]} numberOfLines={2}>{feed.caption}</Text>
            <Text style={[styles.stats, { color: colors.txMuted }]}>❤️ {feed.likes} · 👁️ {feed.views} · 💬 {feed.comments}</Text>
          </View>
          <Pressable disabled={transitioning} onPress={() => navigateOnce(() => navigation.navigate('FeedEdit', { feed }))} style={[styles.iconButton, { backgroundColor: colors.expEditBg }]}>
            <FontAwesome6 name="pen" size={11} color={colors.expEditColor} />
          </Pressable>
          <Pressable onPress={() => remove(feed)} style={[styles.iconButton, { backgroundColor: colors.bgDel }]}>
            <FontAwesome6 name="trash" size={11} color="#fff" />
          </Pressable>
        </View>)}
        <SubmitButton label={transitioning ? '화면 여는 중…' : '피드 만들기'} disabled={transitioning} onPress={() => navigateOnce(() => navigation.navigate('FeedCreate'))} />
      </ScrollView>}
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { height: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5 },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  headerSpacer: { width: 17 },
  loading: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 10 },
  empty: { textAlign: 'center', fontSize: 13, paddingVertical: 36 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, gap: 8 },
  thumb: { width: 54, height: 54, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  camera: { fontSize: 20 },
  info: { flex: 1 },
  caption: { fontSize: 13, fontWeight: '600' },
  stats: { fontSize: 10, marginTop: 5 },
  iconButton: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
