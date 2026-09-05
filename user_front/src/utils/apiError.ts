export function apiError(error: unknown, fallback = '요청에 실패했어요'): string {
    const e = error as {
        response?: {
            data?: {
                message?: string;
                detail?: string;
            };
        };
    };
    return e?.response?.data?.message || e?.response?.data?.detail || fallback;
}
