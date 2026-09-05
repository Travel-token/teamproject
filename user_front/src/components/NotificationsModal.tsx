import React, { useEffect, useState } from 'react';
import { Text, Pressable, ScrollView } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { CancelButton, SubmitButton } from './FormBits';
import { fetchNotifications, markNotificationAsRead, NotificationItem } from '../api/notification';
import { useTheme } from '../theme/ThemeContext';
import { apiError } from '../utils/apiError';
export default function NotificationsModal({ visible, onClose, onRead }: {
    visible: boolean;
    onClose: () => void;
    onRead: () => void;
}) {
    const [items, setItems] = useState<NotificationItem[]>([]), [error, setError] = useState('');
    const { colors } = useTheme();
    const load = () => fetchNotifications().then(v => { setItems(v); setError(''); }).catch(e => setError(apiError(e)));
    useEffect(() => {
        if (visible)
            load();
    }, [visible]);
    return <BottomSheetModal visible={visible} onClose={onClose} title="알림"><ScrollView>{error ? <><Text style={{ color: colors.danger }}>{error}</Text><SubmitButton label="다시 불러오기" onPress={load}/></> : items.length ? items.map(item => <Pressable key={item.id} onPress={async () => {
                try {
                    await markNotificationAsRead(String(item.id));
                    await load();
                    onRead();
                }
                catch (e) {
                    setError(apiError(e));
                }
            }} style={{ padding: 14, opacity: item.read ? 0.55 : 1 }}><Text style={{ color: colors.txPrimary, fontWeight: '700' }}>{item.title}</Text><Text style={{ color: colors.txSecondary }}>{item.body}</Text></Pressable>) : <Text style={{ color: colors.txSecondary }}>새 알림이 없어요.</Text>}</ScrollView><CancelButton onPress={onClose}/></BottomSheetModal>;
}
