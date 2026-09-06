export function formatWon(amount: number): string { return amount.toLocaleString('ko-KR') + '원'; }
export function formatMoney(amount: number, currency = 'KRW'): string { return new Intl.NumberFormat('ko-KR', { style: 'currency', currency }).format(amount); }
