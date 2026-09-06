import { api } from './client';

export interface NotificationItem {
    id: string;
    tripId: string | null;
    type: 'gps' | 'settle' | 'invite' | 'feed_recommend' | 'system';
    title: string;
    body: string;
    actionType: string | null;
    read: boolean;
    createdAt: string;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
    const res = await api.get<NotificationItem[]>('/api/notifications');
    return res.data;
}

export async function markNotificationAsRead(
    notificationId: string,
): Promise<void> {
    await api.patch(`/api/notifications/${notificationId}/read`);
}