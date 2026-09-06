import ApiImage from '../components/ApiImage';
import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useToast } from '../components/Toast';
import { apiError } from '../utils/apiError';
import { fetchFeeds, FeedPost as ApiFeedPost } from '../api/feed';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, TextInput, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import IconCircleButton from '../components/IconCircleButton';
import { useTheme } from '../theme/ThemeContext';
import { FeedPost } from '../types';
import { RootStackParamList, TabParamList } from '../navigation/types';
const TILE_SIZE = Dimensions.get('window').width / 3;
type SortKey = 'popular' | 'recent' | 'distance';
type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'Feed'>, NativeStackScreenProps<RootStackParamList>>;
export default function FeedScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<SortKey>('popular');
    const { showToast } = useToast();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    useFocusEffect(useCallback(() => {
        let alive = true;
        (async () => {
            try {
                let coords: {
                    lat?: number;
                    lng?: number;
                } = {};
                if (sort === 'distance') {
                    const permission = await Location.getForegroundPermissionsAsync();
                    if (permission.status !== 'granted') {
                        showToast('거리순 조회에는 위치 권한이 필요해요');
                        return;
                    }
                    const loc = await Location.getCurrentPositionAsync({});
                    coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
                }
                const items = await fetchFeeds({ sort: sort === 'recent' ? 'latest' : sort, ...coords });
                if (alive)
                    setPosts(items.map(toFeedCard));
            }
            catch (e) {
                if (alive)
                    showToast(apiError(e, '피드를 불러오지 못했어요'));
            }
        })();
        return () => { alive = false; };
    }, [sort]));
    const data = useMemo(() => {
        let list = posts.filter((p) => p.place.includes(query) || p.caption.includes(query));
        if (sort === 'popular')
            list = [...list].sort((a, b) => b.likes - a.likes);
        if (sort === 'recent')
            list = [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
        if (sort === 'distance')
            list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
        return list;
    }, [posts, query, sort]);
    return (<View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.pageTitle, { color: colors.txPrimary }]}>피드</Text>
        <View style={styles.topRight}>
          <IconCircleButton icon="bell" showDot/>
          <Pressable onPress={() => navigation.navigate('MyPage')}>
            <Avatar label="나" size={34}/>
          </Pressable>
        </View>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.bgInput, borderColor: colors.bdInput }]}>
        <FontAwesome6 name="magnifying-glass" size={13} color={colors.txMuted}/>
        <TextInput value={query} onChangeText={setQuery} placeholder="장소, 여행지 검색..." placeholderTextColor={colors.txPlaceholder} style={[styles.searchInput, { color: colors.txPrimary }]}/>
      </View>

      <View style={styles.sortBar}>
        <SortChip icon="fire" label="인기순" active={sort === 'popular'} onPress={() => setSort('popular')}/>
        <SortChip icon="clock" label="최신순" active={sort === 'recent'} onPress={() => setSort('recent')}/>
        <SortChip icon="location-dot" label="거리순" active={sort === 'distance'} onPress={() => setSort('distance')}/>
      </View>

      <FlatList data={data} keyExtractor={(item) => item.id} numColumns={3} contentContainerStyle={{ paddingBottom: 20 }} renderItem={({ item, index }) => (<FeedGridItem post={item} index={index} onPress={() => navigation.navigate('FeedDetail', { post: item })}/>)}/>
    </View>);
}
function SortChip({ icon, label, active, onPress, }: {
    icon: React.ComponentProps<typeof FontAwesome6>['name'];
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    const { colors } = useTheme();
    return (<Pressable onPress={onPress} style={[
            styles.chip,
            { backgroundColor: active ? colors.bgChipActive : colors.bgCard2 },
        ]}>
      <FontAwesome6 name={icon} size={9} color={active ? '#FFFFFF' : colors.txMuted}/>
      <Text style={{ fontSize: 11, marginLeft: 5, color: active ? '#FFFFFF' : colors.txMuted, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>);
}
function toFeedCard(item: ApiFeedPost): FeedPost {
    return {
        id: String(item.id),
        emoji: '📷',
        place: item.placeName ?? '',
        date: item.createdAt,
        distanceKm: item.distanceKm ?? Number.POSITIVE_INFINITY,
        photoUrls: item.photoUrls ?? [],
        likes: item.likeCount,
        views: item.viewCount,
        caption: item.caption,
        authorName: item.authorName || '알 수 없는 사용자',
        authorProfileImageUrl: item.authorProfileImageUrl,
        likedByMe: item.likedByMe,
    };
}
function gridBgColor(index: number, palette: string[]) {
    const n = index + 1; // CSS nth-child은 1-based
    if (n % 4 === 0)
        return palette[3];
    if (n % 3 === 0)
        return palette[2];
    if (n % 3 === 2)
        return palette[1];
    return palette[0];
}
function FeedGridItem({ post, index, onPress }: {
    post: FeedPost;
    index: number;
    onPress: () => void;
}) {
    const { colors } = useTheme();
    return (<Pressable onPress={onPress} style={[
            styles.gridItem,
            {
                width: TILE_SIZE - 1.34,
                height: post.tall ? TILE_SIZE * 2 - 2 : TILE_SIZE - 2,
                backgroundColor: gridBgColor(index, colors.bgCollage),
            },
        ]}>
      {post.photoUrls?.[0] ? <ApiImage uri={post.photoUrls[0]} style={{ width: "100%", height: "100%" }}/> : <Text style={styles.gridEmoji}>{post.emoji}</Text>}
      <View style={styles.gridTag}>
        <Text style={styles.gridTagText} numberOfLines={1}>{post.place.split(',')[0]}</Text>
      </View>
      <View style={styles.gridLikes}>
        <FontAwesome6 name="eye" size={9} color="#FFFFFF"/>
        <Text style={styles.gridLikesText}>{post.views}</Text>
      </View>
    </Pressable>);
}
const styles = StyleSheet.create({
    screen: { flex: 1 },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 10,
    },
    pageTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
    topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 0.5,
        gap: 8,
    },
    searchInput: { flex: 1, fontSize: 13 },
    sortBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 10 },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
    },
    gridItem: {
        marginRight: 2,
        marginBottom: 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    gridEmoji: { fontSize: 36 },
    gridTag: {
        position: 'absolute',
        top: 5,
        left: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    gridTagText: { fontSize: 9, fontWeight: '600', color: '#FFFFFF' },
    gridLikes: {
        position: 'absolute',
        bottom: 5,
        right: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    gridLikesText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
});
