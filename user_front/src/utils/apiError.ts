import axios from 'axios';

export function apiError(error: unknown, fallback = '요청에 실패했어요'): string {
    const e = error as {
        response?: {
            data?: {
                message?: string;
                detail?: string;
            };
        };
    };
    const message = e?.response?.data?.message;
    const detail = e?.response?.data?.detail;
    if (typeof message === 'string' && message) return message;
    if (typeof detail === 'string' && detail) return detail;
    if (error instanceof Error && !axios.isAxiosError(error)) return error.message || fallback;
    return fallback;
}
