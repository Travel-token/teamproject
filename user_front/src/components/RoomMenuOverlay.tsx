import React, { useState } from 'react';
import EndTripModal from './EndTripModal';
import FeedRecommendModal from './FeedRecommendModal';
import RoomMenuDropdown from './RoomMenuDropdown';
import TripInfoEditDrawer from './TripInfoEditDrawer';
import { useToast } from './Toast';

export default function RoomMenuOverlay({
  menuOpen,
  onCloseMenu,
  emoji,
  name,
  dateLabel,
  onSaveTripInfo,
}: {
  menuOpen: boolean;
  onCloseMenu: () => void;
  emoji: string;
  name: string;
  dateLabel: string;
  onSaveTripInfo: (emoji: string, name: string) => void;
}) {
  const { showToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [endTripOpen, setEndTripOpen] = useState(false);
  const [recommendOpen, setRecommendOpen] = useState(false);

  return (
    <>
      <RoomMenuDropdown
        visible={menuOpen}
        onClose={onCloseMenu}
        onEditTrip={() => setEditOpen(true)}
        onEndTrip={() => setEndTripOpen(true)}
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
        onConfirm={() => setRecommendOpen(true)}
      />
      <FeedRecommendModal
        visible={recommendOpen}
        onClose={() => setRecommendOpen(false)}
        onCreateFeeds={() => showToast('📸 선택한 피드가 만들어졌어요')}
      />
    </>
  );
}
