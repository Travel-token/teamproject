import React, { useEffect, useState } from 'react';
import { Text, Pressable, ScrollView, View } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, SubmitButton } from './FormBits';
import { fetchNotifications, markNotificationAsRead, NotificationItem } from '../api/notification';
import { fetchInvitations, acceptInvitation, declineInvitation, Invitation } from '../api/notificationEvents';
import { useTheme } from '../theme/ThemeContext';
import { apiError } from '../utils/apiError';
import { navigationRef } from '../navigation/pushNavigation';

export default function NotificationsModal({ visible, onClose, onRead }: { visible: boolean; onClose: () => void; onRead: () => void }) {
    const { colors } = useTheme();
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const load = async () => {
        const [notifications, invites] = await Promise.allSettled([fetchNotifications(), fetchInvitations()]);
        const errors: string[] = [];
        if (notifications.status === 'fulfilled') setItems(notifications.value);
        else { setItems([]); errors.push('알림: ' + apiError(notifications.reason)); }
        if (invites.status === 'fulfilled') setInvitations(invites.value);
        else { setInvitations([]); errors.push('여행 초대: ' + apiError(invites.reason)); }
        setError(errors.join('\n'));
    };
    useEffect(() => { if (visible) void load().catch(e => setError(apiError(e))); }, [visible]);
    async function act(action: () => Promise<void>) {
        if (busy) return; setBusy(true);
        try { await action(); } catch (e) { setError(apiError(e)); } finally { setBusy(false); }
    }
    return <BottomSheetModal visible={visible} onClose={onClose} title="알림과 여행 초대">
        <ScrollView>
            {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
            <SubmitButton label="새로고침" onPress={() => act(load)} />
            {invitations.map(invitation => <View key={'invite-' + invitation.id} style={{ padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.bdCard, borderRadius: 12 }}>
                <Text style={{ color: colors.txPrimary, fontWeight: '700' }}>{invitation.tripName}</Text>
                <Text style={{ color: colors.txSecondary }}>{invitation.inviterName}님이 초대했어요.</Text>
                <SubmitButton label={busy ? '처리 중…' : '여행 참여 수락'} onPress={() => act(async () => {
                    const result = await acceptInvitation(invitation.id);
                    await load(); onRead(); onClose();
                    if (navigationRef.isReady()) navigationRef.navigate('RoomMap', { tripId: String(result.tripId) });
                })} />
                <Pressable disabled={busy} onPress={() => act(async () => { await declineInvitation(invitation.id); await load(); })}><Text style={{ color: colors.txMuted, padding: 12 }}>초대 거절</Text></Pressable>
            </View>)}
            {items.map(item => <Pressable key={String(item.id)} disabled={busy} onPress={() => act(async () => {
                await markNotificationAsRead(String(item.id)); await load(); onRead();
                if (item.tripId && navigationRef.isReady() && (item.type === 'gps' || item.type === 'settle')) {
                    onClose();
                    if (item.type === 'gps') navigationRef.navigate('RoomMap', { tripId: String(item.tripId) });
                    else navigationRef.navigate('RoomSettle', { tripId: String(item.tripId) });
                }
            })} style={{ padding: 14, opacity: item.read ? 0.55 : 1 }}>
                <Text style={{ color: colors.txPrimary, fontWeight: '700' }}>{item.title}</Text>
                <Text style={{ color: colors.txSecondary }}>{item.body}</Text>
            </Pressable>)}
            {!items.length && !invitations.length && !error ? <Text style={{ color: colors.txSecondary }}>새 알림이나 초대가 없어요.</Text> : null}
        </ScrollView>
        <CancelButton onPress={onClose} />
    </BottomSheetModal>;
}
