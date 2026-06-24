// ============================================================
// 전역 상수
// ============================================================

// Spring Boot 백엔드 base URL.
// 개발 중엔 .env 또는 app.config.js의 extra 값으로 분리하는 걸 권장합니다.


//export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const USE_MOCK = true;

export const API_BASE_URL =
  'http://localhost:8080/api';

export const SOCIAL_LOGIN_PROVIDERS = [
  { key: 'google', label: 'Google로 로그인' },
  { key: 'kakao', label: '카카오로 로그인' },
  { key: 'naver', label: '네이버로 로그인' },
  { key: 'apple', label: 'Apple로 로그인' },
];

export const EXPENSE_CATEGORIES = ['meal', 'ticket', 'cafe', 'shop', 'trans', 'etc'];

export const EXPENSE_FILTER_CATEGORIES = ['all', 'meal', 'ticket', 'cafe', 'shop', 'trans'];

export const SPLIT_TYPES = {
  EQUAL: 'equal',
  SOLO: 'solo',
  RATIO: 'ratio',
};

export const SETTLE_STATUS = {
  DONE: 'done',
  REQUESTED: 'requested',
  PENDING: 'pending',
};

export const FEED_SORT = {
  NEAR: 'near',
  POPULAR: 'popular',
  RECENT: 'recent',
};

export const CURRENCIES = [
  { code: 'KRW', label: '🇰🇷 KRW 한국 원' },
  { code: 'USD', label: '🇺🇸 USD 미국 달러' },
  { code: 'JPY', label: '🇯🇵 JPY 일본 엔' },
  { code: 'EUR', label: '🇪🇺 EUR 유로' },
];
