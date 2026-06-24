// ============================================================
// 포맷팅 유틸
// ============================================================

/** 원본 fmtAmt(n) → '₩' + 천단위 콤마 */
export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return `₩${n.toLocaleString('ko-KR')}`;
}

/** 원본 fmtViews(n) → 1만/1천 단위 축약 */
export function formatViews(n) {
  const num = Number(n) || 0;
  if (num >= 10000) {
    return `${(Math.floor(num / 1000) / 10).toFixed(1).replace(/\.0$/, '')}만`;
  }
  if (num >= 1000) {
    return `${(Math.floor(num / 100) / 10).toFixed(1).replace(/\.0$/, '')}천`;
  }
  return num.toLocaleString('ko-KR');
}

/** YYYY-MM-DD → 'M월 D일' */
export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
}

/** 여행 기간 라벨: '5월 5일 ~ 5월 7일 · 3박' */
export function formatTripDateRange(startDate, endDate, nights) {
  return `${formatDateShort(startDate)} ~ ${formatDateShort(endDate)} · ${nights}박`;
}

/** 퍼센트 계산 (0~100, 소수 없이) */
export function calcPercent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}
