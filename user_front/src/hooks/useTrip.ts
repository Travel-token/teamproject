import { useCallback, useEffect, useState } from 'react';
import { Trip } from '../types';
import { trips as mockTrips } from '../data/mockData';
import { fetchTripRaw, toTrip, updateTrip, completeTrip, deleteTrip, TripPayload } from '../api/trip';

/**
 * 여행방 화면 공용 훅.
 * 서버에서 여행 단건을 조회하고, 실패 시 mock 데이터로 대체한다.
 * 수정/종료/삭제 API도 함께 제공한다.
 */
export function useTripDetail(tripId: string) {
    const fallback = mockTrips.find((t) => t.id === tripId) ?? mockTrips[0];

    // 조회 전 mock을 그대로 노출하면 다른 여행 정보가 잠깐 보이므로 빈 값으로 시작한다.
    const [trip, setTrip] = useState<Trip>(() => makePlaceholder(tripId));
    const [loading, setLoading] = useState(true);
    const [isServerTrip, setIsServerTrip] = useState(false);

    // 수정 시 날짜가 초기화되지 않도록 서버 원본 값을 보관한다.
    const [serverDates, setServerDates] = useState<{ startDate: string | null; endDate: string | null }>({
        startDate: null,
        endDate: null,
    });

    useEffect(() => {
        let alive = true;
        setTrip(makePlaceholder(tripId));

        (async () => {
            setLoading(true);
            try {
                const raw = await fetchTripRaw(tripId);
                if (!alive) return;
                setTrip(toTrip(raw));
                setServerDates({ startDate: raw.startDate, endDate: raw.endDate });
                setIsServerTrip(true);
            } catch (e) {
                if (!alive) return;
                console.warn('[trip] 단건 조회 실패, mock 데이터 사용', e);
                setTrip(fallback);
                setIsServerTrip(false);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId]);

    /** 이름/이모지 등 화면 값만 즉시 반영 (서버 저장은 saveTrip에서 처리) */
    const patchLocal = useCallback((partial: Partial<Trip>) => {
        setTrip((prev) => ({ ...prev, ...partial }));
    }, []);

    /** 여행 정보 수정. 서버 여행이 아니면 로컬 상태만 갱신한다. */
    const saveTrip = useCallback(
        async (payload: Partial<TripPayload>) => {
            const next = { ...trip, ...payload } as Trip;
            patchLocal(payload as Partial<Trip>);

            if (!isServerTrip) return next;

            try {
                const today = new Date().toISOString().slice(0, 10);
                const startDate = payload.startDate ?? serverDates.startDate ?? today;
                const endDate = payload.endDate ?? serverDates.endDate ?? startDate;

                const saved = await updateTrip(tripId, {
                    name: payload.name ?? trip.name,
                    region: payload.region ?? trip.region,
                    startDate,
                    endDate,
                    budget: payload.budget ?? null,
                });
                setServerDates({ startDate, endDate });
                setTrip(saved);
                return saved;
            } catch (e) {
                console.warn('[trip] 수정 실패', e);
                return next;
            }
        },
        [trip, tripId, isServerTrip, patchLocal, serverDates]
    );

    /** 여행 종료 (status → completed) */
    const endTrip = useCallback(async () => {
        if (!isServerTrip) return false;
        try {
            const saved = await completeTrip(tripId);
            setTrip(saved);
            return true;
        } catch (e) {
            console.warn('[trip] 종료 실패', e);
            return false;
        }
    }, [tripId, isServerTrip]);

    /** 여행 삭제 (동선·지출·멤버는 DB에서 연쇄 삭제) */
    const removeTrip = useCallback(async () => {
        if (!isServerTrip) return false;
        try {
            await deleteTrip(tripId);
            return true;
        } catch (e) {
            console.warn('[trip] 삭제 실패', e);
            return false;
        }
    }, [tripId, isServerTrip]);

    return { trip, loading, isServerTrip, patchLocal, saveTrip, endTrip, removeTrip };
}


// 서버 응답 전 표시용 빈 여행
function makePlaceholder(tripId: string): Trip {
    return {
        id: tripId,
        name: '',
        region: '',
        emoji: '🧳',
        status: '진행 중',
        dateLabel: '',
        days: 1,
        myExpense: 0,
        totalExpense: 0,
        members: [],
        collage: [],
    };
}