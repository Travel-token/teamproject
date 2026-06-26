import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useTrip } from '../../src/context/TripContext';
import { useToast } from '../../src/context/ToastContext';
import StatBox from '../../src/components/common/StatBox';
import AppButton from '../../src/components/common/AppButton';
import ToggleRow from '../../src/components/common/ToggleRow';
import Avatar from '../../src/components/common/Avatar';

// const PROFILE_STATS = [
//   { label: '여행 횟수', value: '3회' },
//   { label: '총 여행 일수', value: '12일' },
//   { label: '방문 장소', value: '23곳' },
//   { label: '총 지출', value: '₩1.4M' },
// ];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, logout, withdraw } = useAuth();
  const { members } = useTrip();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);

  const [settings, setSettings] = useState({ notif: true, invite: true, gps: true, mkt: false, dark: false });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    const labels = {
      notif: '알림 설정이 변경되었습니다',
      gps: 'GPS 설정이 변경되었습니다',
      invite: '여행 초대 알림 설정이 변경됐습니다',
      mkt: '마케팅 알림 설정이 변경됐습니다',
      dark: settings.dark ? '라이트 모드로 전환되었습니다 ☀️' : '다크 모드가 활성화되었습니다 🌙',
    };
    toast.show(labels[key] || '설정이 변경되었습니다');
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateProfile({ name: nameInput.trim() });
      toast.show('프로필이 저장되었습니다');
    }
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('로그아웃 하시겠습니까?', '', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: async () => {
          await logout();
          toast.show('로그아웃 되었습니다');
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert('미정산 금액이 남아있을 수 있습니다.', '계속 진행하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '계속',
        style: 'destructive',
        onPress: () => {
          Alert.alert('그동안의 여행 기록이 모두 사라집니다.', '정말로 탈퇴하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
              text: '탈퇴',
              style: 'destructive',
              onPress: async () => {
                await withdraw();
                toast.show('탈퇴 처리가 완료됐습니다');
                router.replace('/(auth)/login');
              },
            },
          ]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.push('/(tabs)/home')}>
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>프로필</Text>
        <Pressable
          style={styles.editBtn}
          onPress={() => (editing ? handleSaveName() : setEditing(true))}
        >
          <Ionicons name={editing ? 'checkmark' : 'pencil-outline'} size={13} color={colors.textPrimary} />
          <Text style={styles.editBtnText}>{editing ? '저장' : '수정'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHead}>
          <View style={styles.photo}>
            <Text style={{ fontSize: 32 }}>{user.emoji}</Text>
          </View>
          {editing ? (
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={styles.nameInput}
              textAlign="center"
            />
          ) : (
            <Text style={styles.name}>{user.name}</Text>
          )}
          <Text style={styles.loginType}>{user.loginType} 계정으로 로그인</Text>
          <Text style={styles.uid}>
            {user.handle} · ID: {user.uid}
          </Text>
        </View>

        {/* <View style={styles.statsGrid}>
          {PROFILE_STATS.map((s) => (
            <StatBox key={s.label} label={s.label} value={s.value} style={styles.statGridItem} valueStyle={{ fontSize: fontSize.xl }} />
          ))}
        </View> */}

        {/* 정산 받을 계좌 */}
        <View style={styles.accountBox}>
          <View style={styles.accountHeaderRow}>
            <Text style={styles.accountHeaderTitle}>
              <Ionicons name="business-outline" size={13} color={colors.tpMid} /> 정산 받을 계좌
            </Text>
            <Pressable onPress={() => setEditingAccount((v) => !v)}>
              <Text style={styles.accountEditLink}>{editingAccount ? '취소' : '수정'}</Text>
            </Pressable>
          </View>
          {!editingAccount ? (
            <>
              <Text style={styles.accountBank}>{user.account.bank}</Text>
              <View style={styles.accountNumberRow}>
                <Text style={styles.accountNumber}>{user.account.number}</Text>
                <Pressable
                  style={styles.copyBtn}
                  onPress={() => toast.show('계좌번호가 복사됐어요! 📋')}
                >
                  <Ionicons name="copy-outline" size={11} color={colors.textPrimary} />
                  <Text style={styles.copyBtnText}>복사</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <TextInput
                style={styles.accountEditInput}
                defaultValue={user.account.number}
                placeholder="계좌번호 입력"
              />
              <AppButton
                title="저장"
                onPress={() => {
                  setEditingAccount(false);
                  toast.show('계좌 정보가 저장됐어요 ✅');
                }}
              />
            </View>
          )}
        </View>

        <Text style={styles.partnerLabel}>자주 함께한 파트너</Text>
        <View style={styles.partnerRow}>
          {members.slice(1, 3).map((m) => (
            <View key={m.id} style={styles.partnerItem}>
              <Avatar label={m.short} colorKey={m.color} />
              <Text style={styles.partnerName}>{m.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.settingsLabel}>설정</Text>
        <ToggleRow
          icon={<Ionicons name="cash-outline" size={16} color={colors.tp} />}
          label="정산 알림"
          value={settings.notif}
          onValueChange={() => toggleSetting('notif')}
        />
        <ToggleRow
          icon={<Ionicons name="mail-outline" size={16} color={colors.tp} />}
          label="여행 초대 알림"
          value={settings.invite}
          onValueChange={() => toggleSetting('invite')}
        />
        <ToggleRow
          icon={<Ionicons name="location-outline" size={16} color={colors.tp} />}
          label="GPS 추천 알림"
          value={settings.gps}
          onValueChange={() => toggleSetting('gps')}
        />
        <ToggleRow
          icon={<Ionicons name="megaphone-outline" size={16} color={colors.tp} />}
          label="마케팅 알림"
          value={settings.mkt}
          onValueChange={() => toggleSetting('mkt')}
        />
        <ToggleRow
          icon={<Ionicons name="moon-outline" size={16} color={colors.tp} />}
          label="다크 모드"
          value={settings.dark}
          onValueChange={() => toggleSetting('dark')}
          noBorder
        />

        <View style={styles.divider} />

        <AppButton
          variant="secondary"
          title="로그아웃"
          color={colors.ta}
          icon={<Ionicons name="log-out-outline" size={16} color={colors.ta} />}
          onPress={handleLogout}
          style={{ marginBottom: spacing.sm }}
        />
        <AppButton
          variant="secondary"
          title="회원 탈퇴"
          color={colors.tc}
          icon={<Ionicons name="trash-outline" size={16} color={colors.tc} />}
          onPress={handleWithdraw}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderTertiary,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: radius.round, backgroundColor: colors.bgSecondary,
    borderWidth: 0.5, borderColor: colors.borderTertiary, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: fontSize.title, fontWeight: '600', color: colors.textPrimary },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.bgSecondary, borderWidth: 0.5, borderColor: colors.borderTertiary,
    borderRadius: radius.sm, paddingVertical: 7, paddingHorizontal: 11,
  },
  editBtnText: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: '500' },
  scrollContent: { padding: spacing.xl, paddingBottom: 60 },
  profileHead: { alignItems: 'center', marginBottom: spacing.lg },
  photo: {
    width: 84, height: 84, borderRadius: radius.round, backgroundColor: colors.tpLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  name: { fontSize: fontSize.h2, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  nameInput: {
    fontSize: fontSize.xl, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.tp, minWidth: 160,
  },
  loginType: { fontSize: fontSize.md, color: colors.textSecondary },
  uid: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statGridItem: { flexBasis: '47%', flexGrow: 1 },
  accountBox: {
    backgroundColor: colors.tpLight, borderRadius: radius.xl, padding: spacing.md + 2,
    marginBottom: spacing.lg, borderWidth: 0.5, borderColor: colors.tp,
  },
  accountHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  accountHeaderTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.tpMid },
  accountEditLink: { fontSize: fontSize.base, color: colors.textSecondary },
  accountBank: { fontSize: fontSize.base, color: colors.textSecondary },
  accountNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  accountNumber: { fontSize: fontSize.ml, fontWeight: '700', color: colors.textPrimary },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.bgPrimary, borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: 8,
  },
  copyBtnText: { fontSize: fontSize.sm, color: colors.textPrimary },
  accountEditInput: {
    backgroundColor: colors.bgPrimary, borderRadius: radius.md, padding: spacing.sm,
    fontSize: fontSize.md, borderWidth: 0.5, borderColor: colors.borderSecondary,
  },
  partnerLabel: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing.sm },
  partnerRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  partnerItem: { alignItems: 'center', gap: 4 },
  partnerName: { fontSize: fontSize.sm, color: colors.textSecondary },
  divider: { height: 0.5, backgroundColor: colors.borderTertiary, marginVertical: spacing.lg },
  settingsLabel: {
    fontSize: fontSize.base, fontWeight: '500', color: colors.textSecondary,
    textTransform: 'uppercase', marginBottom: spacing.sm,
  },
});
