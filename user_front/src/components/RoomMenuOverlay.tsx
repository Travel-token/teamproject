import InviteMemberModal from './InviteMemberModal';

import BottomSheetModal from './BottomSheetModal';
import { SubmitButton, CancelButton } from './FormBits';
import React, { useState } from 'react';
import EndTripModal from './EndTripModal';
import FeedRecommendModal from './FeedRecommendModal';
import RoomMenuDropdown from './RoomMenuDropdown';
import TripInfoEditDrawer from './TripInfoEditDrawer';
import { useToast } from './Toast';
export default function RoomMenuOverlay({ menuOpen, onCloseMenu, emoji, name, dateLabel, tripId, onSaveTripInfo, onEndTrip, onDeleteTrip, onDeleted, }: {
    menuOpen: boolean;
    onCloseMenu: () => void;
    emoji: string;
    name: string;
    dateLabel: string;
    /** AI 추천 조회 대상 여행 id */
    tripId?: string;
    onSaveTripInfo: (emoji: string, name: string) => Promise<void>;
    onEndTrip: () => Promise<boolean>;
    onDeleteTrip: () => Promise<boolean>;
    onDeleted: () => void;
}) {
    const { showToast } = useToast();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [endTripOpen, setEndTripOpen] = useState(false);
    const [recommendOpen, setRecommendOpen] = useState(false);
    return (<>
        <RoomMenuDropdown visible={menuOpen} onClose={onCloseMenu} onEditTrip={() => setEditOpen(true)} onEndTrip={() => setEndTripOpen(true)} onDeleteTrip={() => setDeleteOpen(true)} onInvite={() => { onCloseMenu(); setInviteOpen(true); }} onRecommend={() => setRecommendOpen(true)} />
        {tripId && <InviteMemberModal visible={inviteOpen} onClose={() => setInviteOpen(false)} tripId={tripId} name={name} />}
        <BottomSheetModal visible={deleteOpen} onClose={() => setDeleteOpen(false)} title="여행을 삭제할까요?"><SubmitButton label={deleting ? "삭제 중…" : "삭제"} disabled={deleting} onPress={async () => {
            if (deleting) return;
            setDeleting(true);
            try {
            if (await onDeleteTrip()) {
                setDeleteOpen(false);
                onDeleted();
            }
            } finally { setDeleting(false); }
        }} /><CancelButton onPress={() => setDeleteOpen(false)} /></BottomSheetModal>
        <TripInfoEditDrawer visible={editOpen} emoji={emoji} name={name} dateLabel={dateLabel} onClose={() => setEditOpen(false)} onSave={async (e, n) => {
            await onSaveTripInfo(e, n);
            showToast('✏️ 여행 정보가 수정됐어요');
        }} />
        <EndTripModal visible={endTripOpen} onClose={() => setEndTripOpen(false)} onConfirm={async () => {
            const completed = await onEndTrip();
            if (!completed) {

                return false;
            }
            showToast('🏁 여행이 종료됐어요');
            showToast('정산 탭에서 정산을 생성하거나 확인해 주세요');
            return true;
        }} />
        <FeedRecommendModal visible={recommendOpen} onClose={() => setRecommendOpen(false)} onCreateFeeds={() => showToast('📸 선택한 피드가 만들어졌어요')} tripId={tripId} />
    </>);
}
