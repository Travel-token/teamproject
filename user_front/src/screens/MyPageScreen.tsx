import { FontAwesome6 } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Avatar from '../components/Avatar';
import BottomSheetModal from '../components/BottomSheetModal';
import FeedFormModal, { FeedFormValue } from '../components/FeedFormModal';
import { CancelButton, SubmitButton } from '../components/FormBits';
import ToggleSwitch from '../components/ToggleSwitch';
import { useToast } from '../components/Toast';
import { formatWon, historyTrips } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { HistoryTrip } from '../types';
import { RootStackParamList, TabParamList } from '../navigation/types';

interface MyFeedItem {
  id: string;
  emoji: string;
  place: string;
  caption: string;
  likes: number;
  views: number;
}

const INITIAL_MY_FEEDS: MyFeedItem[] = [
  { id: 'mf1', emoji: '🌅', place: '성산일출봉, 제주', caption: '일출 보러 새벽 5시에 올라갔더니 이런 뷰가 ☀️', likes: 38, views: 412 },
  { id: 'mf2', emoji: '🍜', place: '동문시장, 제주', caption: '야시장 국수 진짜 맛있었다 🍜', likes: 21, views: 189 },
  { id: 'mf3', emoji: '🏛️', place: '불국사, 경주', caption: '천 년 된 절인데 이렇게 힐링이 되네.', likes: 15, views: 132 },
];

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'MyPage'>,
  NativeStackScreenProps<RootStackParamList>
>;

type TopTab = 'history' | 'mypage';

export default function MyPageScreen({ navigation }: Props) {
  const { colors, isDark, setMode } = useTheme();
  const [topTab, setTopTab] = useState<TopTab>('mypage');

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>
      <View style={styles.topBar}>
        <Text style={[styles.pageTitle, { color: colors.txPrimary }]}>MY</Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable onPress={() => setTopTab('history')} style={styles.tabBtn}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: topTab === 'history' ? '700' : '500',
              color: topTab === 'history' ? colors.txPrimary : colors.txMuted,
            }}
          >
            여행 기록
          </Text>
        </Pressable>
        <Pressable onPress={() => setTopTab('mypage')} style={styles.tabBtn}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: topTab === 'mypage' ? '700' : '500',
              color: topTab === 'mypage' ? colors.txPrimary : colors.txMuted,
            }}
          >
            마이페이지
          </Text>
        </Pressable>
      </View>

      {topTab === 'mypage' ? (
        <MyPagePanel isDark={isDark} onToggleDark={(v) => setMode(v ? 'dark' : 'light')} />
      ) : (
        <HistoryPanel
          onTripPress={(tripId) => navigation.navigate('RoomExpense', { tripId: tripId === 'h1' ? 'jeju' : 'seoul' })}
        />
      )}
    </View>
  );
}

function MyPagePanel({ isDark, onToggleDark }: { isDark: boolean; onToggleDark: (v: boolean) => void }) {
  const { colors } = useTheme();
  const [notifSettle, setNotifSettle] = useState(true);
  const [notifInvite, setNotifInvite] = useState(true);
  const [notifGps, setNotifGps] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [paySync, setPaySync] = useState(false);
  const [myFeedOpen, setMyFeedOpen] = useState(false);
  const [myFeeds, setMyFeeds] = useState<MyFeedItem[]>(INITIAL_MY_FEEDS);
  const [feedFormVisible, setFeedFormVisible] = useState(false);
  const [feedFormMode, setFeedFormMode] = useState<'create' | 'edit'>('create');
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null);
  const { showToast } = useToast();

  const totalLikes = myFeeds.reduce((sum, f) => sum + f.likes, 0);
  const totalViews = myFeeds.reduce((sum, f) => sum + f.views, 0);

  const openCreateFeed = () => {
    setFeedFormMode('create');
    setEditingFeedId(null);
    setFeedFormVisible(true);
  };
  const openEditFeed = (id: string) => {
    setFeedFormMode('edit');
    setEditingFeedId(id);
    setFeedFormVisible(true);
  };
  const editingFeed = myFeeds.find((f) => f.id === editingFeedId);

  const submitFeed = (value: FeedFormValue) => {
    if (feedFormMode === 'create') {
      setMyFeeds((prev) => [
        { id: `mf${Date.now()}`, emoji: value.emoji, place: value.place, caption: value.caption, likes: 0, views: 0 },
        ...prev,
      ]);
      showToast('📸 피드가 등록됐어요');
    } else if (editingFeedId) {
      setMyFeeds((prev) => prev.map((f) => (f.id === editingFeedId ? { ...f, ...value } : f)));
      showToast('✏️ 피드가 수정됐어요');
    }
  };

  const deleteFeed = (id: string) => {
    Alert.alert('삭제할까요?', undefined, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => setMyFeeds((prev) => prev.filter((f) => f.id !== id)) },
    ]);
  };

  return (
    <>
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.profileFeedRow}>
        <View style={styles.profileCol}>
          <View style={{ position: 'relative' }}>
            <Avatar label="나" size={60} />
            <Pressable
              onPress={() => Alert.alert('프로필 수정')}
              style={[styles.profileEditBtn, { backgroundColor: colors.bgHero, borderColor: colors.bgScreen }]}
            >
              <FontAwesome6 name="pen" size={8} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={[styles.profileName, { color: colors.txPrimary }]}>김여행</Text>
          <Text style={[styles.profileHandle, { color: colors.txMuted }]}>@travel_kim · kakao</Text>
        </View>

        <Pressable onPress={() => setMyFeedOpen(true)} style={styles.myFeedCol}>
          <View style={styles.myFeedLabelRow}>
            <Text style={{ fontSize: 20 }}>📸</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.txMuted }}>내 피드</Text>
          </View>
          <View style={styles.myFeedCountRow}>
            <Text style={[styles.myFeedCount, { color: colors.txPrimary }]}>{myFeeds.length}</Text>
            <View style={{ alignItems: 'flex-start', gap: 2 }}>
              <Text style={{ fontSize: 10, color: colors.txMuted }}>❤️ {totalLikes}</Text>
              <Text style={{ fontSize: 10, color: colors.txMuted }}>👁️ {totalViews}</Text>
            </View>
          </View>
        </Pressable>
      </View>

      <Pressable
        onPress={() => Alert.alert('계좌번호 복사됨')}
        style={[styles.accountRow, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: colors.txMuted, marginBottom: 4 }}>송금 계좌번호</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.txPrimary }}>카카오뱅크 3333-04-1234567</Text>
        </View>
        <Pressable onPress={() => Alert.alert('계좌 수정')} style={[styles.editBtn, { backgroundColor: colors.bgCard2 }]}>
          <FontAwesome6 name="pen" size={11} color={colors.txSecondary} />
        </Pressable>
      </Pressable>

      <SettingGroup title="알림">
        <SettingRow icon="bell" label="정산 알림" value={notifSettle} onChange={setNotifSettle} />
        <SettingRow icon="paper-plane" label="여행 초대 알림" value={notifInvite} onChange={setNotifInvite} />
        <SettingRow icon="location-dot" label="GPS 장소 추천" value={notifGps} onChange={setNotifGps} />
        <SettingRow icon="bullhorn" label="마케팅 알림" value={notifMarketing} onChange={setNotifMarketing} />
      </SettingGroup>

      <SettingGroup title="앱 설정">
        <SettingRowValue icon="globe" label="언어" value="한국어" />
        <SettingRow icon="moon" label="다크 모드" value={isDark} onChange={onToggleDark} />
        <SettingRow icon="credit-card" label="알림·문자 결제내역 연동" value={paySync} onChange={setPaySync} />
      </SettingGroup>

      <SettingGroup title="기타">
        <SettingRowValue icon="file-lines" label="이용약관" />
        <SettingRowValue icon="shield-halved" label="개인정보처리방침" />
        <SettingRowValue icon="circle-info" label="버전 정보" value="v2.0.0" noChevron />
      </SettingGroup>

      <View style={styles.dangerRow}>
        <Pressable onPress={() => Alert.alert('로그아웃')}>
          <Text style={{ fontSize: 13, color: colors.txSecondary }}>로그아웃</Text>
        </Pressable>
        <Text style={{ color: colors.bdCard, fontSize: 13 }}>|</Text>
        <Pressable onPress={() => Alert.alert('회원 탈퇴')}>
          <Text style={{ fontSize: 13, color: colors.bgDel }}>회원 탈퇴</Text>
        </Pressable>
      </View>
    </ScrollView>

    <MyFeedModal
      visible={myFeedOpen}
      onClose={() => setMyFeedOpen(false)}
      feeds={myFeeds}
      onCreate={openCreateFeed}
      onEdit={openEditFeed}
      onDelete={deleteFeed}
    />

    <FeedFormModal
      visible={feedFormVisible}
      onClose={() => setFeedFormVisible(false)}
      mode={feedFormMode}
      initialValue={editingFeed ? { place: editingFeed.place, caption: editingFeed.caption, emoji: editingFeed.emoji } : undefined}
      onSubmit={submitFeed}
    />
    </>
  );
}

function MyFeedModal({
  visible,
  onClose,
  feeds,
  onCreate,
  onEdit,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  feeds: MyFeedItem[];
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="내 피드" maxHeightPct={88}>
      {feeds.length === 0 ? (
        <Text style={{ textAlign: 'center', fontSize: 12, color: colors.txMuted, paddingVertical: 20 }}>
          아직 등록한 피드가 없어요.
        </Text>
      ) : (
        <View style={{ gap: 8 }}>
          {feeds.map((f) => (
            <View key={f.id} style={[styles.myFeedRow, { backgroundColor: colors.bgCard2 }]}>
              <View style={[styles.myFeedThumb, { backgroundColor: colors.bgCollage[0] }]}>
                <Text style={{ fontSize: 22 }}>{f.emoji}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.myFeedPlace, { color: colors.txPrimary }]} numberOfLines={1}>{f.place}</Text>
                <Text style={{ fontSize: 11, color: colors.txMuted, marginTop: 2 }} numberOfLines={1}>{f.caption}</Text>
                <Text style={{ fontSize: 10, color: colors.txMuted, marginTop: 3 }}>❤️ {f.likes} · 👁️ {f.views}</Text>
              </View>
              <Pressable onPress={() => onEdit(f.id)} style={[styles.myFeedIconBtn, { backgroundColor: colors.expEditBg }]}>
                <FontAwesome6 name="pen" size={10} color={colors.expEditColor} />
              </Pressable>
              <Pressable onPress={() => onDelete(f.id)} style={[styles.myFeedIconBtn, { backgroundColor: colors.bgDel, marginLeft: 6 }]}>
                <FontAwesome6 name="trash" size={10} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
      <SubmitButton label="피드 만들기" onPress={onCreate} />
      <CancelButton label="닫기" onPress={onClose} />
    </BottomSheetModal>
  );
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={[styles.groupLabel, { color: colors.txMuted }]}>{title}</Text>
      <View style={[styles.groupCard, { backgroundColor: colors.bgSettings, borderColor: colors.bdCard }]}>
        {children}
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ComponentProps<typeof FontAwesome6>['name'];
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.settingRow}>
      <View style={[styles.sgIcon, { backgroundColor: colors.sgIconBg }]}>
        <FontAwesome6 name={icon} size={13} color={colors.sgIconColor} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.txPrimary }]}>{label}</Text>
      <ToggleSwitch value={value} onChange={onChange} />
    </View>
  );
}

function SettingRowValue({
  icon,
  label,
  value,
  noChevron,
}: {
  icon: React.ComponentProps<typeof FontAwesome6>['name'];
  label: string;
  value?: string;
  noChevron?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.settingRow}>
      <View style={[styles.sgIcon, { backgroundColor: colors.sgIconBg }]}>
        <FontAwesome6 name={icon} size={13} color={colors.sgIconColor} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.txPrimary }]}>{label}</Text>
      {value && <Text style={{ fontSize: 12, color: colors.txMuted, marginRight: 6 }}>{value}</Text>}
      {!noChevron && <FontAwesome6 name="chevron-right" size={11} color={colors.chevronColor} />}
    </View>
  );
}

function HistoryPanel({ onTripPress }: { onTripPress: (id: string) => void }) {
  const { colors } = useTheme();
  const pinned = historyTrips.filter((t) => !t.hidden);
  const hidden = historyTrips.filter((t) => t.hidden);
  const [showHidden, setShowHidden] = useState(false);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}>
        <StatCell value="12" label="여행 횟수" />
        <StatCell value="48" label="총 여행일수" />
        <StatCell value="28" label="방문 장소" />
        <StatCell value="3.2만" label="총 지출액" last />
      </View>

      <View style={styles.histHd}>
        <Text style={[styles.groupLabelBig, { color: colors.txPrimary }]}>내 여행</Text>
        <Text style={{ fontSize: 12, color: colors.txMuted }}>{pinned.length}개</Text>
      </View>

      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {pinned.map((t) => (
          <HistoryCard key={t.id} trip={t} onPress={() => onTripPress(t.id)} />
        ))}
      </View>

      <Pressable
        onPress={() => setShowHidden((v) => !v)}
        style={[styles.moreBtn, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}
      >
        <FontAwesome6 name={showHidden ? 'chevron-up' : 'chevron-down'} size={12} color={colors.txSecondary} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.txSecondary, marginLeft: 8 }}>
          {showHidden ? '숨기기' : '전체 여행 더보기'}
        </Text>
      </Pressable>

      {showHidden && (
        <View style={{ paddingHorizontal: 20, gap: 8, marginTop: 10 }}>
          {hidden.map((t) => (
            <HistoryCard key={t.id} trip={t} faded onPress={() => onTripPress(t.id)} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatCell({ value, label, last }: { value: string; label: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCell, !last && { borderRightWidth: 0.5, borderRightColor: colors.bdCard }]}>
      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.txPrimary }}>{value}</Text>
      <Text style={{ fontSize: 10, color: colors.txMuted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function HistoryCard({ trip, onPress, faded }: { trip: HistoryTrip; onPress: () => void; faded?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.histCard, { backgroundColor: colors.bgCard, borderColor: colors.bdCard, opacity: faded ? 0.7 : 1 }]}
    >
      {trip.collage.length ? (
        <View style={styles.histCollage}>
          {trip.collage.map((e, i) => (
            <View key={i} style={[styles.histCollageCell, { backgroundColor: colors.bgCollage[i % 4] }]}>
              <Text style={{ fontSize: 16 }}>{e}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.histNoImg, { backgroundColor: colors.bgCard2 }]}>
          <Text style={{ fontSize: 16 }}>📷</Text>
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.histName, { color: colors.txPrimary }]}>{trip.name}</Text>
        <Text style={[styles.histDate, { color: colors.txMuted }]}>{trip.dateLabel}</Text>
        <Text style={[styles.histAmt, { color: colors.txPrimary }]}>{formatWon(trip.amount)}</Text>
      </View>
      <View
        style={[
          styles.histBadge,
          { backgroundColor: trip.badge === '진행 중' ? colors.bgBadgeLive : colors.bgBadgeDone },
        ]}
      >
        <Text
          style={{
            fontSize: 10,
            fontWeight: '700',
            color: trip.badge === '진행 중' ? '#FFFFFF' : colors.txBadgeDone,
          }}
        >
          {trip.badge}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
  pageTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 20, marginBottom: 12 },
  tabBtn: { paddingVertical: 6 },
  profileFeedRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginVertical: 16, gap: 14 },
  profileCol: { alignItems: 'center' },
  profileEditBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  profileName: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  profileHandle: { fontSize: 10, marginTop: 2 },
  myFeedCol: { flex: 1, alignSelf: 'stretch', justifyContent: 'center' },
  myFeedLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  myFeedCountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  myFeedCount: { fontSize: 22, fontWeight: '800' },
  myFeedRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14 },
  myFeedThumb: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  myFeedPlace: { fontSize: 13, fontWeight: '700' },
  myFeedIconBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  editBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  groupLabel: { fontSize: 12, fontWeight: '600', marginHorizontal: 20, marginBottom: 6, marginTop: 10 },
  groupLabelBig: { fontSize: 14, fontWeight: '700' },
  groupCard: { marginHorizontal: 20, borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  sgIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 13, flex: 1 },
  dangerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 },
  statCard: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, borderRadius: 14, borderWidth: 0.5, paddingVertical: 12 },
  statCell: { flex: 1, alignItems: 'center' },
  histHd: { paddingHorizontal: 20, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  histCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, borderWidth: 0.5 },
  histCollage: { width: 56, height: 56, borderRadius: 12, flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden' },
  histCollageCell: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  histNoImg: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  histName: { fontSize: 13, fontWeight: '700' },
  histDate: { fontSize: 11, marginTop: 2 },
  histAmt: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  histBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 0.5,
  },
});
