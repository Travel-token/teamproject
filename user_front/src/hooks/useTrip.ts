import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Trip } from '../types';
import { fetchTripRaw, fetchMembers, toTrip, updateTrip, completeTrip, deleteTrip, TripPayload, ServerTrip } from '../api/trip';
export function useTripDetail(tripId: string) {
    const [trip, setTrip] = useState<Trip>({ id: tripId, name: '', region: '', emoji: '🧳', currency: 'KRW', status: '진행 중', dateLabel: '', days: 1, myExpense: 0, totalExpense: 0, members: [], collage: [] });
    const [raw, setRaw] = useState<ServerTrip | null>(null);
    const [loading, setLoading] = useState(true);
    useFocusEffect(useCallback(() => {
        let alive = true;
        setLoading(true);
        Promise.all([fetchTripRaw(tripId), fetchMembers(tripId)]).then(([r, m]) => {
            if (alive) {
                setRaw(r);
                setTrip(toTrip(r, m));
            }
        }).catch(() => {
            if (alive)
                setRaw(null);
        }).finally(() => {
            if (alive)
                setLoading(false);
        });
        return () => { alive = false; };
    }, [tripId]));
    const patchLocal = (p: Partial<Trip>) => setTrip(t => ({ ...t, ...p }));
    const saveTrip = async (p: Partial<TripPayload>) => {
        if (!raw)
            throw Error('여행을 먼저 불러와 주세요');
        const result = await updateTrip(tripId, { name: p.name ?? raw.name, region: p.region ?? raw.region ?? '', startDate: p.startDate ?? raw.startDate ?? '', endDate: p.endDate ?? raw.endDate ?? '', budget: p.budget === undefined ? raw.budget : p.budget, emoji: p.emoji ?? raw.emoji ?? '🧳', currency: p.currency ?? raw.currency ?? 'KRW' });
        const next = { ...result, members: trip.members };
        setTrip(next);
        setRaw(await fetchTripRaw(tripId));
        return next;
    };
    const endTrip = async () => {
        try {
            const result = await completeTrip(tripId);
            setTrip({ ...result, members: trip.members });
            return true;
        }
        catch {
            return false;
        }
    };
    const removeTrip = async () => {
        try {
            await deleteTrip(tripId);
            return true;
        }
        catch {
            return false;
        }
    };
    return { trip, loading, isServerTrip: !!raw, patchLocal, saveTrip, endTrip, removeTrip };
}
