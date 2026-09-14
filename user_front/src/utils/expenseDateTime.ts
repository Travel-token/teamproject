/** Local wall time for the backend's LocalDateTime; do not convert it to UTC. */
export function nowExpenseDateTime(date = new Date()): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function normalizeExpenseDateTime(value: string): string {
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(\.\d{1,9})?)?$/);
    const invalid = () => new Error('날짜를 2026-09-10T14:30 형식으로 입력해 주세요.');
    if (!match) throw invalid();
    const [, year, month, day, hour, minute, second = '00', fraction = ''] = match;
    const y = Number(year), m = Number(month), d = Number(day);
    const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (y < 1 || m < 1 || m > 12 || d < 1 || d > days[m - 1]
        || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) throw invalid();
    return `${year}-${month}-${day}T${hour}:${minute}:${second}${fraction}`;
}
