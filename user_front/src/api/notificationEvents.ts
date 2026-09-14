import { api } from './client';
export interface Invitation { id: number; tripId: number; tripName: string; inviterName: string; expiresAt: string }
export const fetchInvitations = async () => (await api.get<Invitation[]>('/api/invitations')).data;
export const inviteMember = async (tripId: string, email: string) => {
    await api.post('/api/trips/' + tripId + '/invitations', { email });
};
export const acceptInvitation = async (id: number) => (await api.post<{ tripId: number }>('/api/invitations/' + id + '/accept')).data;
export const declineInvitation = async (id: number) => { await api.post('/api/invitations/' + id + '/decline'); };
export const emitGpsEvent = async (tripId: string, administrativeArea: string) => {
    return (await api.post<{ created: boolean }>('/api/notification-events/gps', { tripId, administrativeArea })).data;
};
