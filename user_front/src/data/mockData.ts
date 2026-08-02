import {
  BalanceRow,
  ExpenseItem,
  FeedPost,
  HistoryTrip,
  PlaceItem,
  Trip,
  TransferItem,
} from '../types';

export const trips: Trip[] = [
  {
    id: 'jeju',
    name: '제주도 여름 여행',
    region: '제주도',
    emoji: '🏝️',
    status: '진행 중',
    dateLabel: '07.10 – 07.14 · 5일',
    days: 5,
    myExpense: 47333,
    totalExpense: 142000,
    members: [
      { id: 'me', name: '나' },
      { id: 'jisu', name: '지수' },
      { id: 'minho', name: '민호' },
    ],
    collage: ['🌊', '🥩', '🌅', '☕'],
  },
  {
    id: 'seoul',
    name: '서울 주말 나들이',
    region: '서울',
    emoji: '🏙️',
    status: '진행 중',
    dateLabel: '06.28 – 06.29 · 2일',
    days: 2,
    myExpense: 20000,
    totalExpense: 38000,
    members: [
      { id: 'me', name: '나' },
      { id: 'serin', name: '세린' },
    ],
    collage: [],
  },
];

export const expensesByDate: ExpenseItem[] = [
  {
    id: 'e1',
    dateLabel: '07월 10일 · 1일차',
    emoji: '🥩',
    name: '흑돼지 구이',
    payerName: '지수',
    splitLabel: '3명 균등',
    amount: 72000,
    myShare: 24000,
  },
  {
    id: 'e2',
    dateLabel: '07월 10일 · 1일차',
    emoji: '☕',
    name: '제주 감귤 카페',
    payerName: '나',
    splitLabel: '3명 균등',
    amount: 18000,
    myShare: 6000,
  },
  {
    id: 'e3',
    dateLabel: '07월 11일 · 2일차',
    emoji: '🎫',
    name: '성산일출봉 입장료',
    payerName: '나',
    splitLabel: '3명 균등',
    amount: 9000,
    myShare: 3000,
  },
  {
    id: 'e4',
    dateLabel: '07월 11일 · 2일차',
    emoji: '🚗',
    name: '렌트카',
    payerName: '민호',
    splitLabel: '3명 균등',
    amount: 43000,
    myShare: 14333,
  },
];

export const places: PlaceItem[] = [
  {
    id: 'p1',
    dateLabel: '07월 10일',
    emoji: '✈️',
    name: '제주국제공항',
    timeLabel: '오전 11:30',
    withMembers: '나, 지수, 민호',
  },
  {
    id: 'p2',
    dateLabel: '07월 10일',
    emoji: '🏨',
    name: '제주 게스트하우스',
    timeLabel: '오후 4:00',
    withMembers: '나, 지수, 민호',
  },
];

export const transfers: TransferItem[] = [
  {
    id: 'tf1',
    fromName: '지수',
    toName: '나',
    dateLabel: '07.12',
    method: '카카오페이',
    amount: 14000,
  },
  {
    id: 'tf2',
    fromName: '민호',
    toName: '나',
    dateLabel: '07.13',
    method: '계좌이체',
    amount: 10333,
  },
];

export const balances: BalanceRow[] = [
  { id: 'me', name: '나', isMe: true, amount: -14000 },
  { id: 'jisu', name: '지수', amount: 14000 },
  { id: 'minho', name: '민호', amount: 10333 },
  { id: 'serin', name: '세린', amount: 0 },
];

export const feedPosts: FeedPost[] = [
  { id: 'f1', emoji: '🌊', place: '성산일출봉, 제주', date: '2026-07-10', distanceKm: 128.4, likes: 38, views: 412, caption: '일출 보러 새벽 5시에 올라갔더니 이런 뷰가 ☀️ 힘들게 올라간 보람이 있었다.', tall: true },
  { id: 'f2', emoji: '🍜', place: '동문시장, 제주', date: '2026-07-09', distanceKm: 131.2, likes: 21, views: 189, caption: '야시장 국수 진짜 맛있었다 🍜 다음에 또 올 듯.' },
  { id: 'f3', emoji: '🏛️', place: '불국사, 경주', date: '2026-06-14', distanceKm: 68.9, likes: 15, views: 132, caption: '천 년 된 절인데 이렇게 힐링이 되네.' },
  { id: 'f4', emoji: '🌿', place: '한라산, 제주', date: '2026-07-08', distanceKm: 133.7, likes: 44, views: 501, caption: '정상 찍었다!! 다리는 후들후들 🥲 그래도 뿌듯.' },
  { id: 'f5', emoji: '☕', place: '감귤카페, 제주', date: '2026-07-07', distanceKm: 129.9, likes: 9, views: 77, caption: '귤밭 뷰 카페 여기 실화냐 ☕️' },
  { id: 'f6', emoji: '🌅', place: '일출봉, 제주', date: '2026-07-11', distanceKm: 128.1, likes: 67, views: 733, caption: '인생샷 건졌다 진짜... 새벽에 일어난 보람 있음.', tall: true },
  { id: 'f7', emoji: '🥩', place: '흑돼지골목, 제주', date: '2026-07-06', distanceKm: 130.5, likes: 32, views: 298, caption: '흑돼지 맛집 찾았어요 강추합니다 🥩' },
  { id: 'f8', emoji: '🏖️', place: '협재해변, 제주', date: '2026-07-05', distanceKm: 140.2, likes: 51, views: 587, caption: '물 색깔 실화? 에메랄드빛 그 자체 🏖️' },
  { id: 'f9', emoji: '🐴', place: '마방목지, 제주', date: '2026-07-04', distanceKm: 135.8, likes: 28, views: 245, caption: '말들이랑 눈맞춤 성공 🐴 순둥순둥함.' },
  { id: 'f10', emoji: '🌺', place: '카멜리아힐, 제주', date: '2026-07-03', distanceKm: 122.3, likes: 18, views: 163, caption: '동백꽃 만개했어요 너무 예쁘다 🌺' },
  { id: 'f11', emoji: '🍊', place: '귤밭체험, 제주', date: '2026-07-02', distanceKm: 126.7, likes: 13, views: 109, caption: '직접 딴 귤이 제일 달다 🍊' },
  { id: 'f12', emoji: '⛵', place: '우도, 제주', date: '2026-07-01', distanceKm: 145.9, likes: 39, views: 402, caption: '배 타고 우도 다녀왔어요 완전 추천!' },
];

export const historyTrips: HistoryTrip[] = [
  { id: 'h1', name: '제주도 여름 여행', dateLabel: '2026.07.10 – 14 · 5일', amount: 142000, badge: '진행 중', collage: ['🌊', '🥩', '🌅', '☕'] },
  { id: 'h2', name: '경주 당일치기', dateLabel: '2026.06.14 · 1일', amount: 58500, badge: '완료', collage: ['🏛️', '🌸', '🍱', '🚃'] },
  { id: 'h3', name: '부산 먹방 투어', dateLabel: '2026.05.03 – 04 · 2일', amount: 225500, badge: '완료', collage: [] },
  { id: 'h4', name: '강릉 오션뷰', dateLabel: '2026.04.20 – 21 · 2일', amount: 183000, badge: '완료', collage: ['🍣', '🏯', '🎎', '🌙'], hidden: true },
  { id: 'h5', name: '전주 한옥마을', dateLabel: '2026.03.15 · 1일', amount: 67000, badge: '완료', collage: ['⛩️', '🌙', '🍡', '🎆'], hidden: true },
];

export function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}
