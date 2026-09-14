import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createMyFeed } from '../api/mypage';
import FeedFormModal, { FeedFormValue } from '../components/FeedFormModal';
import { useToast } from '../components/Toast';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { apiError } from '../utils/apiError';

type Props = NativeStackScreenProps<RootStackParamList, 'FeedCreate'>;

export default function FeedCreateScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const { showToast } = useToast();
    const insets = useSafeAreaInsets();

    const submit = async (value: FeedFormValue) => {
        try {
            const place = value.place;
            await createMyFeed({
                placeId: value.placeId,
                externalApiId: place?.externalApiId,
                placeName: place?.name,
                address: place?.address,
                category: place?.category,
                latitude: place?.latitude,
                longitude: place?.longitude,
                thumbnailUrl: place?.thumbnailUrl,
                caption: value.caption,
                photoUrls: value.photoUrl ? [value.photoUrl] : [],
            });
            showToast('📸 피드가 등록됐어요');
            return true;
        } catch (error) {
            console.warn('[feed] 피드 저장 실패', error);
            showToast(apiError(error, '피드를 저장하지 못했어요. 입력 내용을 확인해 주세요.'));
            return false;
        }
    };

    return <View style={[styles.screen, { backgroundColor: colors.bgScreen, paddingTop: insets.top }]}> 
        <View style={[styles.header, { borderBottomColor: colors.bdCard }]}> 
            <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="피드 작성 닫기">
                <FontAwesome6 name="chevron-left" size={17} color={colors.txPrimary} />
            </Pressable>
            <Text style={[styles.title, { color: colors.txPrimary }]}>피드 작성</Text>
            <View style={styles.headerSpacer} />
        </View>
        <FeedFormModal visible mode="create" inline onClose={() => navigation.goBack()} onSubmit={submit} />
    </View>;
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: { height: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5 },
    title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
    headerSpacer: { width: 17 },
});
