import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import EndTripModal from './EndTripModal';
import FeedRecommendModal from './FeedRecommendModal';
import RoomMenuDropdown from './RoomMenuDropdown';
import TripInfoEditDrawer from './TripInfoEditDrawer';
import { useToast } from './Toast';
import { generateRecommendation } from '../api/recommendation';

interface Props {
    menuOpen: boolean;
    onCloseMenu: () => void;
    emoji: string;
    name: string;
    dateLabel: string;
    /** AI 추천 조회 대상 여행 id */
    tripId?: string;
    onSaveTripInfo: (emoji: string, name: string) => void;
    /** 여행 종료 (status → completed). 성공 여부 반환 */
    onEndTrip?: () => Promise<boolean>;
    /** 여행 삭제. 성공 여부 반환 */
    onDeleteTrip?: () => Promise<boolean>;
    /** 삭제 완료 후 화면 이동 처리 */
    onDeleted?: () => void;
}

/** 여행방 상단 ⋯ 메뉴에서 파생되는 모달들을 묶어 관리한다. */
export default function RoomMenuOverlay({
                                            menuOpen,
                                            onCloseMenu,
                                            emoji,
                                            name,
                                            dateLabel,
                                            tripId,
                                            onSaveTripInfo,
                                            onEndTrip,
                                            onDeleteTrip,
                                            onDeleted,
                                        }: Props) {
    const { showToast } = useToast();
    const [editOpen, setEditOpen] = useState(false);
    const [endTripOpen, setEndTripOpen] = useState(false);
    const [recommendOpen, setRecommendOpen] = useState(false);

    /**
     * 여행 종료 처리.
     * 종료 성공 시 AI 추천 초안을 생성한 뒤 추천 모달을 연다.
     * 추천 생성이 실패해도 모달은 열어 기존 추천을 확인할 수 있게 한다.
     */
    const handleEndTrip = async () => {
        const ended = onEndTrip ? await onEndTrip() : true;
        if (!ended) {
            showToast('여행 종료에 실패했어요 ⚠️');
            return;
        }

        if (tripId) {
            try {
                // TODO(정산 연동): 정산 API 완성 시 실제 settlementId로 교체
                await generateRecommendation(tripId, 1);
            } catch (e) {
                console.warn('[reco] 추천 생성 실패', e);
            }
        }
        setRecommendOpen(true);
    };

    /** 삭제는 되돌릴 수 없으므로 확인 후 처리한다. */
    const handleDeleteTrip = () => {
        const msg = `'${name}' 여행을 삭제할까요?\n지출·동선 기록도 함께 삭제되며 복구할 수 없어요.`;

        const run = async () => {
            const deleted = onDeleteTrip ? await onDeleteTrip() : false;
            if (deleted) {
                showToast('🗑️ 여행이 삭제됐어요');
                onDeleted?.();
            } else {
                showToast('삭제에 실패했어요 ⚠️');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(msg)) run();
        } else {
            Alert.alert('여행 삭제', msg, [
                { text: '취소', style: 'cancel' },
                { text: '삭제', style: 'destructive', onPress: run },
            ]);
        }
    };

    return (
        <>
            <RoomMenuDropdown
                visible={menuOpen}
                onClose={onCloseMenu}
                onEditTrip={() => setEditOpen(true)}
                onEndTrip={() => setEndTripOpen(true)}
                onDeleteTrip={handleDeleteTrip}
            />
            <TripInfoEditDrawer
                visible={editOpen}
                emoji={emoji}
                name={name}
                dateLabel={dateLabel}
                onClose={() => setEditOpen(false)}
                onSave={(e, n) => {
                    onSaveTripInfo(e, n);
                    showToast('✏️ 여행 정보가 수정됐어요');
                }}
            />
            <EndTripModal
                visible={endTripOpen}
                onClose={() => setEndTripOpen(false)}
                onConfirm={handleEndTrip}
            />
            <FeedRecommendModal
                visible={recommendOpen}
                onClose={() => setRecommendOpen(false)}
                onCreateFeeds={() => showToast('📸 선택한 피드가 만들어졌어요')}
                tripId={tripId}
            />
        </>
    );
}
