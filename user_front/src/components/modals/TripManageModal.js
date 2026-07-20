import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomSheetModal from '../common/BottomSheetModal';
import AppButton from '../common/AppButton';
import { colors, radius, fontSize, spacing } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';
import { useTrip } from '../../context/TripContext';
import { deleteTrip } from '../../api/tripApi';

function ActionRow({ icon, iconBg, iconColor, title, desc, danger, onPress }) {
    return (
        <Pressable style={styles.actionRow} onPress={onPress}>
            <View style={[styles.actionIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={17} color={iconColor} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, danger && { color: colors.tc }]}>{title}</Text>
                <Text style={styles.actionDesc}>{desc}</Text>
            </View>
        </Pressable>
    );
}

export default function TripManageModal({ visible, onClose, trip, onOpenEdit, onOpenInvite, onOpenKick, onOpenRouteShare }) {
    const router = useRouter();
    const toast = useToast();
    const { setActiveTrip } = useTrip();

    // [h-5] 진짜 삭제: 서버에 DELETE 요청 → 성공 시 화면에서도 제거
    const doDelete = async () => {
        try {
            await deleteTrip(trip.id);          // DELETE /api/trips/{id}
            setActiveTrip(null);                // 화면 상태 비우기 → "진행 중인 여행이 없어요" 화면으로
            onClose();
            toast.show('여행이 삭제되었습니다');
        } catch (e) {
            console.warn('[trip] 삭제 실패:', e?.message);
            toast.show('삭제에 실패했어요 (서버 연결 확인) ⚠️');
        }
    };

    // 삭제는 되돌릴 수 없으니 반드시 한 번 되묻기.
    // 웹과 폰은 확인창 도구가 달라서 갈래를 나눔 (Platform.OS로 현재 환경 판별)
    const handleDelete = () => {
        const msg = `'${trip?.name}' 여행을 정말 삭제할까요?\n복구할 수 없어요.`;
        if (Platform.OS === 'web') {
            if (window.confirm(msg)) doDelete();     // 웹: 브라우저 기본 확인창
        } else {
            Alert.alert('여행 삭제', msg, [           // 폰: RN 네이티브 확인창
                { text: '취소', style: 'cancel' },
                { text: '삭제', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    return (
        <BottomSheetModal visible={visible} onClose={onClose}>
            <Text style={styles.title}>여행 관리</Text>
            <Text style={styles.subtitle}>
                {trip?.emoji} {trip?.name}
            </Text>

            <View style={styles.list}>
                <ActionRow
                    icon="pencil-outline"
                    iconBg={colors.tpLight}
                    iconColor={colors.tp}
                    title="여행 정보 수정"
                    desc="이름·날짜·예산·통화 변경"
                    onPress={() => {
                        onClose();
                        onOpenEdit?.();   // [h-1] 수정 모달 열기 (?.= 함수가 있을 때만 호출)
                    }}
                />
                <ActionRow
                    icon="person-add-outline"
                    iconBg={colors.ttLight}
                    iconColor={colors.tt}
                    title="친구 초대"
                    desc="링크·QR·코드로 초대"
                    onPress={() => {
                        onClose();
                        onOpenInvite?.();
                    }}
                />
                <ActionRow
                    icon="person-remove-outline"
                    iconBg={colors.taLight}
                    iconColor={colors.ta}
                    title="멤버 관리"
                    desc="강퇴 또는 탈퇴 처리"
                    onPress={() => {
                        onClose();
                        onOpenKick?.();
                    }}
                />
                <ActionRow
                    icon="share-social-outline"
                    iconBg={colors.tbLight}
                    iconColor={colors.tb}
                    title="동선 공유"
                    desc="카카오·인스타·링크 공유"
                    onPress={() => {
                        onClose();
                        onOpenRouteShare?.();
                    }}
                />
                <ActionRow
                    icon="bar-chart-outline"
                    iconBg={colors.tpLight}
                    iconColor={colors.tp}
                    title="여행 분석"
                    desc="카테고리별 소비 분석"
                    onPress={() => {
                        onClose();
                        router.push('/trip/stats');
                    }}
                />
                <ActionRow
                    icon="trash-outline"
                    iconBg={colors.tcLight}
                    iconColor={colors.tc}
                    title="여행 삭제"
                    desc="지출·동선 모두 삭제 (복구 불가)"
                    danger
                    onPress={handleDelete}
                />
            </View>

            <AppButton title="닫기" variant="secondary" onPress={onClose} />
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: fontSize.title, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
    subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.lg },
    list: { gap: spacing.sm, marginBottom: spacing.lg },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
    actionIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    actionTitle: { fontSize: fontSize.lg, fontWeight: '500', color: colors.textPrimary },
    actionDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },
});