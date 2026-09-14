import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { updateMyFeed } from '../api/mypage';
import FeedFormModal, { FeedFormValue } from '../components/FeedFormModal';
import { useToast } from '../components/Toast';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { apiError } from '../utils/apiError';

type Props = NativeStackScreenProps<RootStackParamList, 'FeedEdit'>;

export default function FeedEditScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const { feed } = route.params;

  const submit = async (value: FeedFormValue) => {
    try {
      await updateMyFeed(feed.id, { caption: value.caption, photoUrls: value.photoUrl ? [value.photoUrl] : [] });
      showToast('✏️ 피드가 수정됐어요.');
      return true;
    } catch (error) {
      console.warn('[feed] 피드 수정 실패', error);
      showToast(apiError(error, '피드를 수정하지 못했어요. 작성 내용은 유지됩니다.'));
      return false;
    }
  };

  return <View style={[styles.screen, { backgroundColor: colors.bgScreen, paddingTop: insets.top }]}>
    <View style={[styles.header, { borderBottomColor: colors.bdCard }]}> 
      <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="피드 수정 닫기">
        <FontAwesome6 name="chevron-left" size={17} color={colors.txPrimary} />
      </Pressable>
      <Text style={[styles.title, { color: colors.txPrimary }]}>피드 수정</Text>
      <View style={styles.headerSpacer} />
    </View>
    <FeedFormModal visible mode="edit" inline initialValue={{ placeId: feed.placeId, caption: feed.caption, photoUrl: feed.photoUrls[0] ?? '' }} onClose={() => navigation.goBack()} onSubmit={submit} />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { height: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5 },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  headerSpacer: { width: 17 },
});
