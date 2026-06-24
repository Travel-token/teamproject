// ============================================================
// Travel Token 디자인 토큰
// 원본 HTML(:root CSS 변수)을 그대로 옮긴 컬러 시스템입니다.
// ============================================================

export const colors = {
  // Brand colors (pill/포인트 컬러 세트: p=purple, t=teal, c=coral, a=amber, b=blue)
  tp: '#7F77DD',
  tpLight: '#EEEDFE',
  tpMid: '#534AB7',

  tt: '#1D9E75',
  ttLight: '#E1F5EE',
  ttMid: '#0F6E56',

  tc: '#D85A30',
  tcLight: '#FAECE7',

  ta: '#BA7517',
  taLight: '#FAEEDA',

  tb: '#378ADD',
  tbLight: '#E6F1FB',

  // Background
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F5F5F7',
  bgTertiary: '#EBEBF0',

  // Border
  borderTertiary: '#E5E5EA',
  borderSecondary: '#D1D1D6',

  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#AEAEB2',

  // 기타
  white: '#FFFFFF',
  black: '#000000',
  kakaoYellow: '#FEE500',
  kakaoBrown: '#3C1E1E',
};

// 다크모드 팔레트 (toggleDark 로직 대응)
export const darkColors = {
  ...colors,
  bgPrimary: '#1C1C1E',
  bgSecondary: '#2C2C2E',
  bgTertiary: '#3A3A3C',
  borderTertiary: '#38383A',
  borderSecondary: '#48484A',
  textPrimary: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textTertiary: '#636366',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 20,
  round: 999,
};

export const fontSize = {
  xs: 10,
  sm: 11,
  base: 12,
  md: 13,
  lg: 14,
  ml: 15,
  xl: 16,
  title: 17,
  h2: 18,
  h1: 20,
  display: 22,
  hero: 28,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: colors.tp,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 6,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
};

// 카테고리별 색상/이모지 매핑 (지출 카테고리 공통 사용)
export const CATEGORY_META = {
  meal: { label: '식사', emoji: '🍜', color: colors.tp, bg: colors.tpLight },
  ticket: { label: '입장', emoji: '🎫', color: colors.tt, bg: colors.ttLight },
  cafe: { label: '카페', emoji: '☕', color: colors.ta, bg: colors.taLight },
  shop: { label: '쇼핑', emoji: '🛒', color: colors.tc, bg: colors.tcLight },
  trans: { label: '교통', emoji: '🚗', color: colors.tb, bg: colors.tbLight },
  etc: { label: '기타', emoji: '📦', color: colors.textSecondary, bg: colors.bgSecondary },
};

// 멤버 아바타 색상 팔레트 (m1~m4 순환)
export const MEMBER_COLOR_KEYS = ['tp', 'tt', 'ta', 'tc'];
