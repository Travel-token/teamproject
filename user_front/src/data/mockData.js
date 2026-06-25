// ============================================================
// 목업 데이터 (원본 HTML STATE/EXPENSES/PLACES/FEED_POSTS 대응)
// 백엔드(Spring Boot) 연동 전까지 화면을 채우기 위한 임시 데이터입니다.
// 실제 연동 시 src/api/*.js 의 함수들이 이 데이터를 대체합니다.
// ============================================================

export const CURRENT_USER = {
  id: 'u1',
  name: '박찬민',
  loginType: 'Google',
  emoji: '🧳',
  handle: '@chanmin_p',
  uid: 'TT-2026-0042',
  account: { bank: '카카오뱅크', number: '3333-01-1234567' },
};

export const MEMBERS = [
  { id: 'm1', name: '박찬민', short: '박찬', color: 'tp', paid: 152000, isMe: true, role: '방장' },
  { id: 'm2', name: '이지현', short: '이지', color: 'tt', paid: 73800 },
  { id: 'm3', name: '김민준', short: '김민', color: 'ta', paid: 68000 },
  { id: 'm4', name: '최수연', short: '최수', color: 'tc', paid: 34000 },
];



export const AI_FEED_SUGGESTIONS = [
  { id: 'sugg1', placeId: 'p1', caption: '경주 봄 여행 마무리 🌸 불국사에서 시작해서 황리단길 카페까지...' },
  { id: 'sugg2', placeId: 'p5', caption: '황리단길 맛집 투어 완료 ✅ 교동쌈밥, 황남빵, 카페거리까지...' },
  { id: 'sugg3', placeId: 'p3', caption: '첨성대 야경 보러 갔다가 경주 전체를 도장깨기 한 느낌 😆...' },
];

export const ACTIVE_TRIP = {
  id: 't1',
  name: '경주 봄 여행',
  emoji: '🌸',
  status: 'ongoing',
  startDate: '2026-05-05',
  endDate: '2026-05-07',
  nights: 3,
  region: '경주',
  members: MEMBERS,
  placesVisited: 7,
  totalSpent: 327800,
  budget: 500000,
  highlightPlaces: ['불국사', '첨성대'],
};

export const PAST_TRIPS = [
  {
    id: 't2',
    name: '강원도 스키 여행',
    emoji: '🏔️',
    status: 'ended',
    startDate: '2026-01-13',
    endDate: '2026-01-15',
    memberCount: 3,
    region: '강원도',
    totalSpent: 452000,
    placesVisited: 5,
  },
  {
    id: 't3',
    name: '제주 여름 여행',
    emoji: '🌊',
    status: 'ended',
    startDate: '2025-08-10',
    endDate: '2025-08-13',
    memberCount: 2,
    region: '제주',
    totalSpent: 680000,
    placesVisited: 11,
  },
];

export const EXPENSES = [
  { id: 'e1', date: '2026-05-07', emoji: '🍜', name: '교동쌈밥', meta: '식사 · 오늘 12:30 · 박찬민 결제', amount: 48000, cat: 'meal', payer: '박찬민' },
  { id: 'e2', date: '2026-05-07', emoji: '🎫', name: '불국사 입장권', meta: '입장료 · 오늘 10:15 · OCR 자동', amount: 28000, cat: 'ticket', payer: '박찬민' },
  { id: 'e3', date: '2026-05-06', emoji: '☕', name: '황리단길 카페', meta: '카페 · 어제 15:40 · 이지현 결제', amount: 32500, cat: 'cafe', payer: '이지현' },
  { id: 'e4', date: '2026-05-06', emoji: '🛒', name: '경주 기념품', meta: '쇼핑 · 어제 14:10 · 박찬민 결제', amount: 24000, cat: 'shop', payer: '박찬민' },
  { id: 'e5', date: '2026-05-06', emoji: '🍜', name: '경주 한정식', meta: '식사 · 어제 12:00 · 김민준 결제', amount: 68000, cat: 'meal', payer: '김민준' },
  { id: 'e6', date: '2026-05-06', emoji: '🎫', name: '동궁과 월지', meta: '입장료 · 어제 10:30 · OCR 자동', amount: 12000, cat: 'ticket', payer: '이지현' },
  { id: 'e7', date: '2026-05-05', emoji: '🚗', name: '경주 렌트카', meta: '교통 · 이틀 전 09:00 · 박찬민 결제', amount: 80000, cat: 'trans', payer: '박찬민' },
  { id: 'e8', date: '2026-05-05', emoji: '☕', name: '첨성대 근처 카페', meta: '카페 · 이틀 전 16:20 · 이지현 결제', amount: 27300, cat: 'cafe', payer: '이지현' },
  { id: 'e9', date: '2026-05-05', emoji: '🍜', name: '황남빵 + 쌈밥', meta: '식사 · 이틀 전 13:00 · 최수연 결제', amount: 26000, cat: 'meal', payer: '최수연' },
  { id: 'e10', date: '2026-05-05', emoji: '🎫', name: '국립경주박물관', meta: '입장료 · 이틀 전 11:00 · OCR 자동', amount: 8000, cat: 'ticket', payer: '최수연' },
  { id: 'e11', date: '2026-05-05', emoji: '🛒', name: '황리단길 소품', meta: '쇼핑 · 이틀 전 17:30 · 이지현 결제', amount: 14000, cat: 'shop', payer: '이지현' },
];

export const TRIP_LOG = [
  { id: 'l1', name: '불국사', time: '오전 10:00 · 1시간 15분 체류', tagLabels: ['문화유산', '₩28,000'] },
  { id: 'l2', name: '교동쌈밥', time: '오후 12:30 · 식사', tagLabels: ['음식', '₩48,000'] },
  { id: 'l3', name: '황리단길 카페', time: '오후 2:40 · 카페', tagLabels: ['₩32,500'] },
];

export const PLACES = [
  { id: 'p1', name: '불국사', cat: 'heritage', dist: '1.2km', emoji: '🏯', desc: '신라 시대 불교 사찰 · UNESCO 세계유산', avg: '₩7,000', addr: '경북 경주시 진현동' },
  { id: 'p2', name: '석굴암', cat: 'heritage', dist: '2.8km', emoji: '⛩️', desc: '국보 제24호 · 신라 불교 조각 예술의 정수', avg: '₩5,500', addr: '경북 경주시 진현동' },
  { id: 'p3', name: '첨성대', cat: 'heritage', dist: '0.8km', emoji: '🔭', desc: '동양 최초의 천문대 · 선덕여왕 시대 건립', avg: '무료', addr: '경북 경주시 인왕동' },
  { id: 'p4', name: '동궁과 월지', cat: 'nature', dist: '1.5km', emoji: '🌊', desc: '신라 왕궁의 별궁 · 야경 명소', avg: '₩3,000', addr: '경북 경주시 인왕동' },
  { id: 'p5', name: '황리단길', cat: 'food', dist: '0.5km', emoji: '🍜', desc: '경주 핫플레이스 · 전통과 현대의 조화', avg: '₩12,000', addr: '경북 경주시 황남동' },
  { id: 'p6', name: '보문관광단지', cat: 'wellness', dist: '4.2km', emoji: '🌸', desc: '스파·리조트 복합 관광지 · 경주 최대 단지', avg: '₩25,000', addr: '경북 경주시 신평동' },
  { id: 'p7', name: '경주 국립박물관', cat: 'heritage', dist: '1.8km', emoji: '🏛️', desc: '신라 유물 3만여 점 소장 · 무료 입장', avg: '무료', addr: '경북 경주시 인왕동' },
  { id: 'p8', name: '교촌마을', cat: 'food', dist: '0.6km', emoji: '🏘️', desc: '경주 최대 전통 한옥 마을 · 최부자댁', avg: '₩8,000', addr: '경북 경주시 교동' },
];

export const FEED_POSTS = [
  { id: 'f1', placeId: 'p1', author: '박찬민', caption: '불국사 다녀왔어요 🍂 단풍이 너무 예뻤습니다', time: '2시간 전', likes: 128, views: 2347, comments: 12, distKm: 1.2, createdAt: 9 },
  { id: 'f2', placeId: 'p5', author: '이지현', caption: '황리단길 카페거리 완전 핫플 ☕️ 줄 서서 먹었어요', time: '4시간 전', likes: 312, views: 5821, comments: 34, distKm: 0.5, createdAt: 8 },
  { id: 'f3', placeId: 'p3', author: '최수연', caption: '첨성대 야경 찍으러 왔는데 진짜 사진 잘 나와요', time: '어제', likes: 201, views: 4108, comments: 18, distKm: 0.8, createdAt: 7 },
  { id: 'f4', placeId: 'p4', author: '김민준', caption: '동궁과 월지 밤에 가면 더 예뻐요 🌙', time: '어제', likes: 415, views: 9204, comments: 52, distKm: 1.5, createdAt: 6 },
  { id: 'f5', placeId: 'p7', author: '박찬민', caption: '박물관 무료입장이라 가볍게 들렀어요', time: '2일 전', likes: 67, views: 1132, comments: 5, distKm: 1.8, createdAt: 5 },
  { id: 'f6', placeId: 'p6', author: '이지현', caption: '보문관광단지 스파 최고였어요 🌸', time: '3일 전', likes: 189, views: 3614, comments: 21, distKm: 4.2, createdAt: 4 },
  { id: 'f7', placeId: 'p8', author: '최수연', caption: '교촌마을 한옥 스테이 분위기 진짜 좋아요', time: '3일 전', likes: 144, views: 2705, comments: 9, distKm: 0.6, createdAt: 3 },
  { id: 'f8', placeId: 'p2', author: '김민준', caption: '석굴암 올라가는 길 힘들었지만 가치있었어요', time: '4일 전', likes: 98, views: 1893, comments: 7, distKm: 2.8, createdAt: 2 },
  { id: 'f9', placeId: 'p1', author: '이지현', caption: '두번째 방문인데도 또 좋다 불국사 ✨', time: '5일 전', likes: 256, views: 4732, comments: 29, distKm: 1.2, createdAt: 1 },
  { id: 'f10', placeId: 'p5', author: '박찬민', caption: '황리단길 디저트 카페 투어 🍰', time: '6일 전', likes: 177, views: 3268, comments: 14, distKm: 0.5, createdAt: 0 },
];

export const CAT_DATA = [
  { cat: 'meal', label: '🍜 식사', colorKey: 'tp', total: 142000 },
  { cat: 'ticket', label: '🎫 입장', colorKey: 'tt', total: 88000 },
  { cat: 'cafe', label: '☕ 카페', colorKey: 'ta', total: 59800 },
  { cat: 'shop', label: '🛒 쇼핑', colorKey: 'tc', total: 38000 },
];

export const SETTLE_MEMBERS = [
  { id: 'm1', name: '박찬민 (나)', short: '박찬', colorKey: 'tp', paid: 152000, net: 68100, plus: true },
  { id: 'm2', name: '이지현', short: '이지', colorKey: 'tt', paid: 73800, net: -8050, plus: false },
  { id: 'm3', name: '김민준', short: '김민', colorKey: 'ta', paid: 68000, net: -13900, plus: false },
  { id: 'm4', name: '최수연', short: '최수', colorKey: 'tc', paid: 34000, net: -46150, plus: false },
];

export const SETTLE_ROUTES = [
  { from: '김민', to: '박찬', fromColor: 'ta', toColor: 'tp', amount: 49950 },
  { from: '최수', to: '박찬', fromColor: 'tc', toColor: 'tp', amount: 55450 },
  { from: '최수', to: '이지', fromColor: 'tc', toColor: 'tt', amount: 26500 },
];

export const NOTIFICATIONS = [
  { id: 1, type: 'gps', title: '📍 GPS 방문 감지', body: '첨성대 반경 200m 진입 · 방금 전', action: null },
  { id: 2, type: 'settle', title: '💸 정산 요청', body: '김민준님이 ₩81,950 정산을 요청했습니다 · 1시간 전', action: 'settle' },
];

export const AI_QUICK_QUESTIONS = [
  '💸 누가 얼마 보내야 해?',
  '📊 카테고리별 지출 분석해줘',
  '🗺️ 다음 여행 예산 추천해줘',
];

export const AI_RESPONSES = {
  '누가 얼마 보내야 해?':
    '정산 결과를 계산했어요! 💰\n\n김민준 → 박찬민 ₩49,950\n최수연 → 박찬민 ₩55,450\n최수연 → 이지현 ₩26,500\n\n총 3번의 송금으로 깔끔하게 정리돼요 ✅',
  '카테고리별 지출 분석해줘':
    '경주 봄 여행 카테고리 분석이에요 📊\n\n🍜 식사: ₩142,000 (43%)\n🎫 입장료: ₩88,000 (27%)\n☕ 카페: ₩59,800 (18%)\n🚗 교통: ₩80,000 (24%)\n🛒 쇼핑: ₩38,000 (12%)\n\n식비 비중이 높은 여행이었네요! 경주 한정식 덕분인 것 같아요 😄',
  '다음 여행 예산 추천해줘':
    '이전 3번의 여행 데이터를 분석했어요 🗺️\n\n1인당 평균 지출\n• 3박: ₩82,000\n• 4박: 예상 ₩100,000\n\n추천 예산 (4인 기준)\n🏨 숙박: ₩150,000\n🍜 식사: ₩180,000\n🎫 입장: ₩100,000\n🚗 교통: ₩90,000\n────\n💡 총 ₩520,000 권장해요!',
};
