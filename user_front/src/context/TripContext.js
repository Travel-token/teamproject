import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import {
  ACTIVE_TRIP,
  PAST_TRIPS,
  EXPENSES as MOCK_EXPENSES,
  TRIP_LOG as MOCK_TRIP_LOG,
  MEMBERS,
  NOTIFICATIONS as MOCK_NOTIFICATIONS,
} from '../data/mockData';
import {
  fetchActiveTrip,
  fetchExpenses as apiFetchExpenses,
  createExpense as apiCreateExpense,
  createTransfer as apiCreateTransfer,
} from '../api/tripApi';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [activeTrip, setActiveTrip] = useState(ACTIVE_TRIP);
  const [pastTrips, setPastTrips] = useState(PAST_TRIPS);
  const [savedTrips, setSavedTrips] = useState([]);
  const [members, setMembers] = useState(MEMBERS);
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [transfers, setTransfers] = useState([]);
  const [tripLog, setTripLog] = useState(MOCK_TRIP_LOG);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [settleStatus, setSettleStatus] = useState({ m1: 'done', m2: 'requested', m3: 'requested', m4: 'pending' });
  const [settleCompleted, setSettleCompleted] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [gpsLocationLabel, setGpsLocationLabel] = useState('경주시 기준');

  // --------------------------------------------------------
  // 백엔드 연동 지점: 앱 진입 시 진행중 여행/지출 목록을 불러옵니다.
  // 지금은 mock 데이터로 폴백하여 화면이 항상 채워지도록 합니다.
  // --------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const trip = await fetchActiveTrip();
        if (trip) setActiveTrip(trip);
        const list = await apiFetchExpenses(trip?.id);
        if (Array.isArray(list) && list.length) setExpenses(list);
      } catch (e) {
        console.warn('[trip] 초기 데이터 로드 실패, mock 데이터로 표시합니다:', e?.message);
      }
    })();
  }, []);

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const myShare = useMemo(() => (members.length ? Math.round(totalSpent / members.length) : 0), [totalSpent, members]);

  const addExpense = useCallback(
    async (expense) => {
      const localExpense = { id: `e${Date.now()}`, ...expense };
      setExpenses((prev) => [localExpense, ...prev]);
      try {
        const saved = await apiCreateExpense(activeTrip?.id, expense);
        if (saved?.id) {
          setExpenses((prev) => prev.map((e) => (e.id === localExpense.id ? saved : e)));
        }
      } catch (e) {
        console.warn('[trip] addExpense 서버 저장 실패 (로컬에는 반영됨):', e?.message);
      }
      return localExpense;
    },
    [activeTrip]
  );

  const addPlaceToLog = useCallback((place) => {
    setTripLog((prev) => [...prev, { id: `l${Date.now()}`, ...place }]);
  }, []);

  const nudgeMember = useCallback(() => {
    // 실제로는 서버에 알림 발송 API를 호출합니다.
  }, []);

  const confirmMemberSettle = useCallback((memberId) => {
    setSettleStatus((prev) => ({ ...prev, [memberId]: 'done' }));
  }, []);

  const completeSettle = useCallback(() => {
    setSettleCompleted(true);
    addNotificationInternal({ type: 'settle', title: '✅ 정산 완료', body: '경주 봄 여행 정산이 완료되었습니다 · 방금' });
  }, []);

  const revertSettle = useCallback(() => {
    setSettleCompleted(false);
  }, []);

  function addNotificationInternal(n) {
    setNotifications((prev) => [{ id: Date.now(), ...n }, ...prev]);
  }

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const toggleSavedTrip = useCallback((trip) => {
    setSavedTrips((prev) => [...prev, trip]);
    setPastTrips((prev) => prev.filter((t) => t.id !== trip.id));
  }, []);

  const addTransfer = useCallback(
    async (transfer) => {
      const localTransfer = { id: `tr${Date.now()}`, createdAt: new Date().toISOString(), ...transfer };
      setTransfers((prev) => [localTransfer, ...prev]);
      try {
        const saved = await apiCreateTransfer(activeTrip?.id, transfer);
        if (saved?.id) {
          setTransfers((prev) => prev.map((t) => (t.id === localTransfer.id ? saved : t)));
        }
      } catch (e) {
        console.warn('[trip] addTransfer 서버 저장 실패 (로컬에는 반영됨):', e?.message);
      }
      return localTransfer;
    },
    [activeTrip]
  );

  const value = useMemo(
    () => ({
      activeTrip,
      pastTrips,
      savedTrips,
      members,
      expenses,
      transfers,
      tripLog,
      notifications,
      settleStatus,
      settleCompleted,
      totalSpent,
      myShare,
      gpsEnabled,
      gpsLocationLabel,
      setGpsEnabled,
      setGpsLocationLabel,
      addExpense,
      addTransfer,
      addPlaceToLog,
      nudgeMember,
      confirmMemberSettle,
      completeSettle,
      revertSettle,
      addNotification: addNotificationInternal,
      deleteNotification,
      clearAllNotifications,
      toggleSavedTrip,
      setActiveTrip,
    }),
    [
      activeTrip,
      pastTrips,
      savedTrips,
      members,
      expenses,
      transfers, 
      tripLog,
      notifications,
      settleStatus,
      settleCompleted,
      totalSpent,
      myShare,
      gpsEnabled,
      gpsLocationLabel,
      addExpense,
      addTransfer,
      addPlaceToLog,
      nudgeMember,
      confirmMemberSettle,
      completeSettle,
      revertSettle,
      deleteNotification,
      clearAllNotifications,
      toggleSavedTrip,
    ]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip은 TripProvider 내부에서만 사용할 수 있습니다');
  return ctx;
}
