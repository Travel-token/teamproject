import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Path } from 'react-native-svg';
import BottomSheetModal from '../common/BottomSheetModal';
import SegmentedTabBar from '../common/SegmentedTabBar';
import AppButton from '../common/AppButton';
import Avatar from '../common/Avatar';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';

const KAKAO_FRIENDS = [
  { id: 'kf1', name: '정호준', short: '정호', color: 'ta', usesApp: true },
  { id: 'kf2', name: '김유나', short: '유나', color: 'tt', usesApp: false },
];

export default function FriendInviteModal({ visible, onClose, trip }) {
  const [tab, setTab] = useState('code');
  const [joinCode, setJoinCode] = useState('');
  const toast = useToast();

  const inviteCode = 'GJ-2026';
  const inviteLink = 'https://traveltoken.kr/join/GJ-2026';

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Text style={styles.title}>여행 멤버 추가</Text>

      <SegmentedTabBar
        tabs={[
          { key: 'code', label: '초대 코드' },
          { key: 'kakao', label: '카카오 친구' },
          { key: 'link', label: '링크 공유' },
        ]}
        activeKey={tab}
        onChange={setTab}
      />

      {tab === 'code' && (
        <View>
          <View style={styles.codeBox}>
            <Text style={styles.codeHint}>아래 코드를 친구에게 공유하세요</Text>
            <Pressable onPress={() => toast.show('코드가 복사됐어요! 📋')}>
              <Text style={styles.codeText}>{inviteCode}</Text>
            </Pressable>
            <AppButton
              variant="small"
              title="코드 복사"
              icon={<Ionicons name="copy-outline" size={13} color={colors.textPrimary} />}
              onPress={() => toast.show('코드가 복사됐어요! 📋')}
              style={{ marginTop: spacing.sm, alignSelf: 'center' }}
            />
          </View>

          <Text style={styles.label}>코드로 참여하기</Text>
          <View style={styles.joinRow}>
            <TextInput
              style={styles.joinInput}
              placeholder="초대 코드 입력"
              placeholderTextColor={colors.textTertiary}
              value={joinCode}
              onChangeText={setJoinCode}
            />
            <AppButton
              variant="small"
              title="참여"
              onPress={() => {
                if (!joinCode.trim()) return;
                toast.show(`'${joinCode}' 코드로 참여했습니다!`);
                setJoinCode('');
              }}
            />
          </View>
          <Text style={styles.smallNote}>* 중간 합류 시 참여 시점부터 정산에 포함됩니다</Text>
        </View>
      )}

      {tab === 'kakao' && (
        <View style={{ gap: spacing.sm, marginVertical: spacing.md }}>
          {KAKAO_FRIENDS.map((f) => (
            <View key={f.id} style={styles.friendRow}>
              <Avatar label={f.short} colorKey={f.color} />
              <View style={{ flex: 1 }}>
                <Text style={styles.friendName}>{f.name}</Text>
                <Text style={styles.friendStatus}>
                  {f.usesApp ? 'Travel Token 사용 중' : 'Travel Token 미사용'}
                </Text>
              </View>
              <AppButton
                variant="small"
                title={f.usesApp ? '초대' : '링크 전송'}
                onPress={() =>
                  toast.show(f.usesApp ? `${f.name}님을 초대했습니다!` : '앱 설치 링크를 전송했습니다!')
                }
              />
            </View>
          ))}
        </View>
      )}

      {tab === 'link' && (
        <View>
          <View style={styles.linkBox}>
            <Text style={styles.linkText}>{inviteLink}</Text>
          </View>
          <View style={styles.linkBtnRow}>
            <AppButton
              variant="secondary"
              title="복사"
              icon={<Ionicons name="copy-outline" size={16} color={colors.textPrimary} />}
              onPress={() => toast.show('링크가 복사되었습니다!')}
              style={{ flex: 1 }}
            />
            <AppButton
              title="카카오"
              icon={
                <Svg width={16} height={16} viewBox="0 0 24 24">
                  <Rect width={24} height={24} rx={5} fill="#FEE500" />
                  <Path d="M12 4C7.58 4 4 6.91 4 10.5c0 2.28 1.47 4.29 3.7 5.43l-.7 2.59 3.02-2a9.2 9.2 0 0 0 1.98.22c4.42 0 8-2.91 8-6.5S16.42 4 12 4z" fill="#3C1E1E" />
                </Svg>
              }
              onPress={() => toast.show('카카오톡으로 공유되었습니다!')}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}

      <AppButton title="닫기" variant="secondary" onPress={onClose} style={{ marginTop: spacing.lg }} />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  codeBox: { alignItems: 'center', marginVertical: spacing.md },
  codeHint: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.sm },
  codeText: {
    fontSize: 30, fontWeight: '700', color: colors.tp, letterSpacing: 8,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl, backgroundColor: colors.tpLight, borderRadius: radius.lg,
  },
  label: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: 4 },
  joinRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  joinInput: {
    flex: 1, backgroundColor: colors.bgSecondary, borderRadius: radius.md, borderWidth: 0.5,
    borderColor: colors.borderSecondary, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.textPrimary,
  },
  smallNote: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.md },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: 10, backgroundColor: colors.bgSecondary, borderRadius: radius.md },
  friendName: { fontSize: fontSize.lg, fontWeight: '500', color: colors.textPrimary },
  friendStatus: { fontSize: fontSize.base, color: colors.textSecondary },
  linkBox: { padding: spacing.md, backgroundColor: colors.bgSecondary, borderRadius: radius.md, marginVertical: spacing.md },
  linkText: { fontSize: fontSize.md, color: colors.textSecondary },
  linkBtnRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
});
