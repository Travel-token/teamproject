import ApiImage from '../components/ApiImage';
import { formatMoney } from '../utils/format';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Clipboard } from 'react-native';
import { endSession } from '../services/sessionActions';
import { integrationTick } from '../services/integrationLifecycle';
import PaymentCapturePanel from '../components/PaymentCapturePanel';
import { apiError } from '../utils/apiError';
import { updateMyProfileName } from '../api/mypage';
import { FontAwesome6 } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, Pressable, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLocationPermissionStatus, requestLocationPermission, getNotificationPermissionStatus, requestNotificationPermission, openDeviceSettings, } from '../services/devicePermissions';
import Avatar from '../components/Avatar';
import BottomSheetModal from '../components/BottomSheetModal';
import { CancelButton, SubmitButton, FormInput, FormRow } from '../components/FormBits';
import ToggleSwitch from '../components/ToggleSwitch';
import { useToast } from '../components/Toast';
import { formatWon } from '../utils/format';
import { useTheme } from '../theme/ThemeContext';
import { HistoryTrip } from '../types';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { fetchMyProfile, updateAccount, updateNotificationSetting, NotificationKey, fetchMyFeeds, MyFeedItem, fetchHistoryStats, HistoryStats, fetchHistoryTrips, } from '../api/mypage';
type Props = CompositeScreenProps<BottomTabScreenProps<TabParamList, 'MyPage'>, NativeStackScreenProps<RootStackParamList>>;
type TopTab = 'history' | 'mypage';
export default function MyPageScreen({ navigation }: Props) {
    const { colors, isDark, setMode } = useTheme();
    const [topTab, setTopTab] = useState<TopTab>('mypage');
    const insets = useSafeAreaInsets();
    return (<View style={[styles.screen, { backgroundColor: colors.bgScreen }]}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <Text style={[styles.pageTitle, { color: colors.txPrimary }]}>MY</Text>
        </View>

        <View style={styles.tabRow}>
            <Pressable onPress={() => setTopTab('history')} style={styles.tabBtn}>
                <Text style={{
                    fontSize: 14,
                    fontWeight: topTab === 'history' ? '700' : '500',
                    color: topTab === 'history' ? colors.txPrimary : colors.txMuted,
                }}>
                    여행 기록
                </Text>
            </Pressable>
            <Pressable onPress={() => setTopTab('mypage')} style={styles.tabBtn}>
                <Text style={{
                    fontSize: 14,
                    fontWeight: topTab === 'mypage' ? '700' : '500',
                    color: topTab === 'mypage' ? colors.txPrimary : colors.txMuted,
                }}>
                    마이페이지
                </Text>
            </Pressable>
        </View>

        {topTab === 'mypage' ? (<MyPagePanel onOpenMyFeeds={() => navigation.navigate('MyFeedList')} onSignedOut={() => undefined} isDark={isDark} onToggleDark={(v) => setMode(v ? 'dark' : 'light')} />) : (<HistoryPanel onTripPress={(tripId) => navigation.navigate('RoomExpense', { tripId })} />)}
    </View>);
}
function MyPagePanel({ isDark, onToggleDark, onSignedOut, onOpenMyFeeds }: {
    isDark: boolean;
    onToggleDark: (v: boolean) => void;
    onSignedOut: () => void;
    onOpenMyFeeds: () => void;
}) {
    const { colors } = useTheme();
    const { showToast } = useToast();
    const legal = (Constants.expoConfig?.extra?.legal ?? {}) as { privacyPolicyUrl?: string; accountDeletionUrl?: string };
    const openLegal = async (url: string | undefined, label: string) => {
        if (!url) {
            showToast(`${label} 주소가 아직 설정되지 않았어요.`);
            return;
        }
        try { await Linking.openURL(url); }
        catch { showToast(`${label} 페이지를 열지 못했어요.`); }
    };
    const [loading, setLoading] = useState(true);
    const [profileEdit, setProfileEdit] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [notifSettle, setNotifSettle] = useState(true);
    const [notifInvite, setNotifInvite] = useState(true);
    const [notifGps, setNotifGps] = useState(true);
    const [notifMarketing, setNotifMarketing] = useState(false);
    const [pushConnecting, setPushConnecting] = useState(false);
    const [myFeeds, setMyFeeds] = useState<MyFeedItem[]>([]);
    const [accountBank, setAccountBank] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountEditVisible, setAccountEditVisible] = useState(false);
    // 프로필과 내 피드는 서로 독립적으로 반영한다. 한 요청이 실패해도 다른
    // 데이터까지 빈 화면으로 만들지 않으며 탭에 돌아올 때 최신 목록을 읽는다.
    useFocusEffect(useCallback(() => {
        let active = true;
        (async () => {
            const [profileResult, feedsResult] = await Promise.allSettled([fetchMyProfile(), fetchMyFeeds()]);
            if (!active) return;
            if (profileResult.status === 'fulfilled') {
                const profile = profileResult.value;
                setName(profile.name);
                setHandle(profile.handle);
                setAccountBank(profile.bank);
                setAccountNumber(profile.accountNumber);
                setNotifSettle(profile.notifSettle);
                setNotifInvite(profile.notifInvite);
                setNotifGps(profile.notifGps);
                setNotifMarketing(profile.notifMarketing);
                // 현재 앱 테마는 사용자가 토글할 때만 바꾼다. 화면 진입 시 서버의
                // 오래된 기본값으로 덮어쓰면 다크 모드가 갑자기 풀릴 수 있다.
            } else {
                showToast(apiError(profileResult.reason, '프로필을 불러오지 못했어요'));
            }
            if (feedsResult.status === 'fulfilled') {
                setMyFeeds(feedsResult.value);
            } else {
                showToast(apiError(feedsResult.reason, '내 피드를 불러오지 못했어요'));
            }
            setLoading(false);
        })();
        return () => { active = false; };
    }, []));
    const totalLikes = myFeeds.reduce((sum, f) => sum + f.likes, 0);
    const totalViews = myFeeds.reduce((sum, f) => sum + f.views, 0);
    // notifGps는 위치 권한, notifSettle/notifInvite/notifMarketing은 알림 권한과 연동된다.
    // 결제 수집은 PaymentCapturePanel에서 별도의 알림 접근 권한과 동의를 확인한다.
    const requiresLocationPermission = (key: NotificationKey) => key === 'notifGps';
    const requiresNotificationPermission = (key: NotificationKey) => key === 'notifSettle' || key === 'notifInvite' || key === 'notifMarketing';
    const goToDeviceSettingsForPermission = (kind: '위치' | '알림') => {
        // OS가 더 이상 네이티브 권한 팝업을 안 띄워주는 상태 (canAskAgain: false).
        // 확인 얼럿으로 한 번 더 묻지 않고, 왜 이동하는지만 토스트로 짧게 알리고 바로 설정 화면으로 보낸다.
        showToast(`${kind} 권한이 꺼져 있어요. 설정 화면으로 이동할게요.`);
        openDeviceSettings();
    };
    const settingsSaving = useRef(new Set<NotificationKey>());
    const onChangeNotification = async (key: NotificationKey, value: boolean, setLocal: (v: boolean) => void) => {
        if (key === 'darkMode') { setLocal(value); return; }
        if (settingsSaving.current.has(key)) return;
        settingsSaving.current.add(key);
        try {
            // 토글을 켤 때만 기기 권한을 확인한다. 끌 때는 서버 값만 내리면 된다
            // (OS 권한 자체를 앱이 강제로 회수할 수는 없기 때문).
            if (value) {
                if (requiresLocationPermission(key)) {
                    const { status, canAskAgain, error } = await requestLocationPermission();
                    if (error)
                        console.error('[MyPage] 위치 권한 요청 중 오류:', error);
                    if (status !== 'granted') {
                        if (error)
                            showToast(`위치 권한 확인 실패: ${error}`);
                        // canAskAgain === true면 OS가 다음에 눌렀을 때 네이티브 팝업을 다시 띄워준다.
                        // 굳이 안내할 필요 없이, 그냥 다시 시도할 수 있게 조용히 끝낸다.
                        // OS가 더 이상 팝업을 안 띄워주는 상태일 때만 설정 화면으로 바로 이동한다.
                        if (!canAskAgain)
                            goToDeviceSettingsForPermission('위치');
                        return; // 권한 없이는 켜지지 않음 (서버 값도 그대로 유지)
                    }
                }
                else if (requiresNotificationPermission(key)) {
                    const { status, canAskAgain, error } = await requestNotificationPermission();
                    if (error)
                        console.error('[MyPage] 알림 권한 요청 중 오류:', error);
                    if (status !== 'granted') {
                        if (error)
                            showToast(`알림 권한 확인 실패: ${error}`);
                        if (!canAskAgain)
                            goToDeviceSettingsForPermission('알림');
                        return;
                    }
                }
            }
            setLocal(value); // 우선 화면에 바로 반영 (낙관적 업데이트)
            try {
                await updateNotificationSetting(key, value);
            }
            catch (e: any) {
                setLocal(!value); // 실패하면 롤백
                console.error(`[MyPage] ${key} 서버 저장 실패:`, e?.message ?? e);
                showToast('설정 저장에 실패했어요');
            }
        }
        catch (e: any) {
            // 여기까지 오는 건 devicePermissions 쪽에서 예상 못한 예외가 새어나온 경우.
            // 예전엔 이 지점에서 조용히 죽어서 "눌러도 반응 없음"처럼 보였다 — 반드시 로그+토스트로 드러낸다.
            console.error(`[MyPage] ${key} 토글 처리 중 예상치 못한 오류:`, e?.message ?? e);
            showToast('설정 변경 중 오류가 발생했어요');
        } finally { settingsSaving.current.delete(key); }
    };
    const onSaveAccount = async (bank: string, number: string) => {
        try {
            await updateAccount(bank, number);
            setAccountBank(bank);
            setAccountNumber(number);
            setAccountEditVisible(false);
            showToast('💳 계좌번호가 수정됐어요');
        }
        catch (e) {
            showToast('계좌번호 저장에 실패했어요');
        }
    };
    const onLogout = () => {
        Alert.alert('로그아웃 할까요?', undefined, [
            { text: '취소', style: 'cancel' },
            {
                text: '로그아웃',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await endSession();
                        onSignedOut();
                    }
                    catch {
                        showToast('로그아웃을 완료하지 못했어요. 다시 시도해 주세요.');
                    }
                },
            },
        ]);
    };
    const onWithdraw = () => {
        Alert.alert('정말 탈퇴하시겠어요?', '탈퇴하면 되돌릴 수 없어요.', [
            { text: '취소', style: 'cancel' },
            {
                text: '탈퇴',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await endSession(true);
                        onSignedOut();
                    }
                    catch (e) {
                        showToast('탈퇴 처리에 실패했어요');
                    }
                },
            },
        ]);
    };
    if (loading) {
        return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.txPrimary} />
        </View>);
    }
    return (<>
        <BottomSheetModal visible={profileEdit} onClose={() => setProfileEdit(false)} title="프로필 수정"><FormInput value={nameDraft} onChangeText={setNameDraft} placeholder="이름" /><SubmitButton label="저장" disabled={profileSaving || !nameDraft.trim()} onPress={async () => {
            if (profileSaving)
                return;
            setProfileSaving(true);
            try {
                await updateMyProfileName(nameDraft.trim());
                setName(nameDraft.trim());
                setProfileEdit(false);
            }
            catch {
                showToast("프로필 저장에 실패했어요");
            }
            finally {
                setProfileSaving(false);
            }
        }} /><CancelButton onPress={() => setProfileEdit(false)} /></BottomSheetModal>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.profileFeedRow}>
                <View style={styles.profileCol}>
                    <View style={{ position: 'relative' }}>
                        <Avatar label={name ? name.slice(0, 1) : '나'} size={60} />
                        <Pressable onPress={() => { setNameDraft(name); setProfileEdit(true); }} style={[styles.profileEditBtn, { backgroundColor: colors.bgHero, borderColor: colors.bgScreen }]}>
                            <FontAwesome6 name="pen" size={8} color="#FFFFFF" />
                        </Pressable>
                    </View>
                    <Text style={[styles.profileName, { color: colors.txPrimary }]}>{name}</Text>
                    <Text style={[styles.profileHandle, { color: colors.txMuted }]}>{handle}</Text>
                </View>

                <Pressable onPress={onOpenMyFeeds} style={styles.myFeedCol}>
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

            <Pressable onPress={() => { Clipboard.setString(accountNumber); showToast('계좌번호를 복사했어요'); }} style={[styles.accountRow, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: colors.txMuted, marginBottom: 4 }}>송금 계좌번호</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.txPrimary }}>
                        {accountBank} {accountNumber}
                    </Text>
                </View>
                <Pressable onPress={() => setAccountEditVisible(true)} style={[styles.editBtn, { backgroundColor: colors.bgCard2 }]}>
                    <FontAwesome6 name="pen" size={11} color={colors.txSecondary} />
                </Pressable>
            </Pressable>

            <SettingGroup title="알림">
                <SettingRow icon="bell" label="정산 알림" value={notifSettle} onChange={(v) => onChangeNotification('notifSettle', v, setNotifSettle)} />
                <SettingRow icon="paper-plane" label="여행 초대 알림" value={notifInvite} onChange={(v) => onChangeNotification('notifInvite', v, setNotifInvite)} />
                <SettingRow icon="location-dot" label="GPS 장소 추천" value={notifGps} onChange={(v) => onChangeNotification('notifGps', v, setNotifGps)} />
                <SettingRow icon="bullhorn" label="마케팅 알림" value={notifMarketing} onChange={(v) => onChangeNotification('notifMarketing', v, setNotifMarketing)} />
            </SettingGroup>

            <SettingGroup title="앱 설정">
                <SettingRowValue icon="globe" label="언어" value="한국어" noChevron />
                <SettingRow icon="moon" label="다크 모드" value={isDark} onChange={(v) => onChangeNotification('darkMode', v, onToggleDark)} />
                <SubmitButton label={pushConnecting ? '푸시 연결 중…' : '이 기기 푸시 알림 연결'} disabled={pushConnecting} onPress={async () => {
                    if (pushConnecting) return;
                    setPushConnecting(true);
                    try { await integrationTick(true); showToast('기기 푸시가 연결됐어요.'); }
                    catch (e) { showToast(apiError(e)); }
                    finally { setPushConnecting(false); }
                }} />
                <PaymentCapturePanel />
            </SettingGroup>

            <SettingGroup title="기타">
                <SettingRowValue icon="shield-halved" label="개인정보처리방침" onPress={() => void openLegal(legal.privacyPolicyUrl, '개인정보처리방침')} />
                <SettingRowValue icon="user-slash" label="외부 회원탈퇴 안내" onPress={() => void openLegal(legal.accountDeletionUrl, '회원탈퇴 안내')} />
                <SettingRowValue icon="circle-info" label="버전 정보" value="v1.0.1" noChevron />
            </SettingGroup>

            <View style={styles.dangerRow}>
                <Pressable onPress={onLogout}>
                    <Text style={{ fontSize: 13, color: colors.txSecondary }}>로그아웃</Text>
                </Pressable>
                <Text style={{ color: colors.bdCard, fontSize: 13 }}>|</Text>
                <Pressable onPress={onWithdraw}>
                    <Text style={{ fontSize: 13, color: colors.bgDel }}>회원 탈퇴</Text>
                </Pressable>
            </View>
        </ScrollView>

        <AccountEditModal visible={accountEditVisible} onClose={() => setAccountEditVisible(false)} bank={accountBank} number={accountNumber} onSave={onSaveAccount} />

    </>);
}
function AccountEditModal({ visible, onClose, bank, number, onSave, }: {
    visible: boolean;
    onClose: () => void;
    bank: string;
    number: string;
    onSave: (bank: string, number: string) => void;
}) {
    const [bankDraft, setBankDraft] = useState(bank);
    const [numberDraft, setNumberDraft] = useState(number);
    useEffect(() => {
        if (visible) {
            setBankDraft(bank);
            setNumberDraft(number);
        }
    }, [visible, bank, number]);
    return (<BottomSheetModal visible={visible} onClose={onClose} title="계좌번호 수정">
        <FormRow label="은행">
            <FormInput value={bankDraft} onChangeText={setBankDraft} placeholder="예: 카카오뱅크" />
        </FormRow>
        <FormRow label="계좌번호">
            <FormInput value={numberDraft} onChangeText={setNumberDraft} placeholder="예: 3333-04-1234567" keyboardType="numbers-and-punctuation" />
        </FormRow>
        <SubmitButton label="저장하기" disabled={!bankDraft.trim() || !numberDraft.trim()} onPress={() => onSave(bankDraft.trim(), numberDraft.trim())} />
        <CancelButton onPress={onClose} />
    </BottomSheetModal>);
}
function SettingGroup({ title, children }: {
    title: string;
    children: React.ReactNode;
}) {
    const { colors } = useTheme();
    return (<View style={{ marginBottom: 6 }}>
        <Text style={[styles.groupLabel, { color: colors.txMuted }]}>{title}</Text>
        <View style={[styles.groupCard, { backgroundColor: colors.bgSettings, borderColor: colors.bdCard }]}>
            {children}
        </View>
    </View>);
}
function SettingRow({ icon, label, value, onChange, }: {
    icon: React.ComponentProps<typeof FontAwesome6>['name'];
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
}) {
    const { colors } = useTheme();
    return (<View style={styles.settingRow}>
        <View style={[styles.sgIcon, { backgroundColor: colors.sgIconBg }]}>
            <FontAwesome6 name={icon} size={13} color={colors.sgIconColor} />
        </View>
        <Text style={[styles.settingLabel, { color: colors.txPrimary }]}>{label}</Text>
        <ToggleSwitch value={value} onChange={onChange} />
    </View>);
}
function SettingRowValue({ icon, label, value, noChevron, onPress, }: {
    icon: React.ComponentProps<typeof FontAwesome6>['name'];
    label: string;
    value?: string;
    noChevron?: boolean;
    onPress?: () => void;
}) {
    const { colors } = useTheme();
    const content = <>
        <View style={[styles.sgIcon, { backgroundColor: colors.sgIconBg }]}>
            <FontAwesome6 name={icon} size={13} color={colors.sgIconColor} />
        </View>
        <Text style={[styles.settingLabel, { color: colors.txPrimary }]}>{label}</Text>
        {value && <Text style={{ fontSize: 12, color: colors.txMuted, marginRight: 6 }}>{value}</Text>}
        {!noChevron && <FontAwesome6 name="chevron-right" size={11} color={colors.chevronColor} />}
    </>;
    return onPress
        ? <Pressable accessibilityRole="link" onPress={onPress} style={styles.settingRow}>{content}</Pressable>
        : <View style={styles.settingRow}>{content}</View>;
}
function HistoryPanel({ onTripPress }: {
    onTripPress: (id: string) => void;
}) {
    const { colors } = useTheme();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<HistoryStats | null>(null);
    const [trips, setTrips] = useState<HistoryTrip[]>([]);
    const [showHidden, setShowHidden] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const isFirstRun = React.useRef(true);
    useEffect(() => {
        (async () => {
            try {
                const [s, t] = await Promise.all([fetchHistoryStats(), fetchHistoryTrips()]);
                setStats(s);
                setTrips(t);
            }
            catch (e) {
                showToast('여행 기록을 불러오지 못했어요');
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    // 검색어가 바뀔 때마다 서버에 다시 조회 (디바운스, 최초 마운트 시엔 스킵)
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        const timer = setTimeout(() => {
            fetchHistoryTrips(searchQuery.trim() || undefined)
                .then(setTrips)
                .catch(() => showToast('검색에 실패했어요'));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    const q = searchQuery.trim();
    const pinned = trips.filter((t) => !t.hidden);
    const hidden = trips.filter((t) => t.hidden);
    const toggleSearch = () => {
        setSearchOpen((prev) => {
            if (prev)
                setSearchQuery('');
            return !prev;
        });
    };
    if (loading) {
        return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.txPrimary} />
        </View>);
    }
    return (<ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}>
            <StatCell value={`${stats?.tripCount ?? 0}`} label="여행 횟수" />
            <StatCell value={`${stats?.totalDays ?? 0}`} label="총 여행일수" />
            <StatCell value={`${stats?.placeCount ?? 0}`} label="방문 장소" />
            <StatCell value={stats?.totalsByCurrency ? Object.entries(stats.totalsByCurrency).map(([c, n]) => formatMoney(n, c)).join(" / ") : formatWon(stats?.totalExpense ?? 0)} label="총 지출액" last />
        </View>

        <View style={styles.histHd}>
            {searchOpen ? (<View style={[styles.histSearchBox, { backgroundColor: colors.bgInput, borderColor: colors.bdInput }]}>
                <FontAwesome6 name="magnifying-glass" size={12} color={colors.txMuted} />
                <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="여행 기록 검색..." placeholderTextColor={colors.txPlaceholder} style={[styles.histSearchInput, { color: colors.txPrimary }]} autoFocus />
                <Pressable onPress={toggleSearch}>
                    <FontAwesome6 name="xmark" iconStyle="solid" size={14} color={colors.txMuted} />
                </Pressable>
            </View>) : (<>
                <Text style={[styles.groupLabelBig, { color: colors.txPrimary }]}>내 여행</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 12, color: colors.txMuted }}>{pinned.length}개</Text>
                    <Pressable onPress={toggleSearch}>
                        <FontAwesome6 name="magnifying-glass" iconStyle="solid" size={13} color={colors.txMuted} />
                    </Pressable>
                </View>
            </>)}
        </View>

        <View style={{ paddingHorizontal: 20, gap: 8 }}>
            {pinned.map((t) => (<HistoryCard key={t.id} trip={t} onPress={() => onTripPress(t.id)} />))}
            {q.length > 0 && pinned.length === 0 && hidden.length === 0 && (<Text style={{ fontSize: 12, color: colors.txMuted, textAlign: 'center', paddingVertical: 20 }}>
                '{q}'에 대한 검색 결과가 없어요
            </Text>)}
        </View>

        <Pressable onPress={() => setShowHidden((v) => !v)} style={[styles.moreBtn, { backgroundColor: colors.bgCard, borderColor: colors.bdCard }]}>
            <FontAwesome6 name={showHidden ? 'chevron-up' : 'chevron-down'} size={12} color={colors.txSecondary} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.txSecondary, marginLeft: 8 }}>
                {showHidden ? '숨기기' : '전체 여행 더보기'}
            </Text>
        </Pressable>

        {showHidden && (<View style={{ paddingHorizontal: 20, gap: 8, marginTop: 10 }}>
            {hidden.map((t) => (<HistoryCard key={t.id} trip={t} faded onPress={() => onTripPress(t.id)} />))}
        </View>)}
    </ScrollView>);
}
function StatCell({ value, label, last }: {
    value: string;
    label: string;
    last?: boolean;
}) {
    const { colors } = useTheme();
    return (<View style={[styles.statCell, !last && { borderRightWidth: 0.5, borderRightColor: colors.bdCard }]}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.txPrimary }}>{value}</Text>
        <Text style={{ fontSize: 10, color: colors.txMuted, marginTop: 2 }}>{label}</Text>
    </View>);
}
function HistoryCard({ trip, onPress, faded }: {
    trip: HistoryTrip;
    onPress: () => void;
    faded?: boolean;
}) {
    const { colors } = useTheme();
    return (<Pressable onPress={onPress} style={[styles.histCard, { backgroundColor: colors.bgCard, borderColor: colors.bdCard, opacity: faded ? 0.7 : 1 }]}>
        {trip.collage.length ? (<View style={styles.histCollage}>
            {trip.collage.map((e, i) => (<View key={i} style={[styles.histCollageCell, { backgroundColor: colors.bgCollage[i % 4] }]}>
                <ApiImage uri={e} style={{ width: "100%", height: "100%" }} />
            </View>))}
        </View>) : (<View style={[styles.histNoImg, { backgroundColor: colors.bgCard2 }]}>
            <Text style={{ fontSize: 16 }}>📷</Text>
        </View>)}
        <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.histName, { color: colors.txPrimary }]}>{trip.name}</Text>
            <Text style={[styles.histDate, { color: colors.txMuted }]}>{trip.dateLabel}</Text>
            <Text style={[styles.histAmt, { color: colors.txPrimary }]}>{formatMoney(trip.amount, trip.currency)}</Text>
        </View>
        <View style={[
            styles.histBadge,
            { backgroundColor: trip.badge === '진행 중' ? colors.bgBadgeLive : colors.bgBadgeDone },
        ]}>
            <Text style={{
                fontSize: 10,
                fontWeight: '700',
                color: trip.badge === '진행 중' ? '#FFFFFF' : colors.txBadgeDone,
            }}>
                {trip.badge}
            </Text>
        </View>
    </Pressable>);
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
    histHd: { paddingHorizontal: 20, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    histSearchBox: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
        borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7,
    },
    histSearchInput: { flex: 1, fontSize: 13, padding: 0 },
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
