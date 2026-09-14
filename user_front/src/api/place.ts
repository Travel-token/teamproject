import { api } from './client';

export interface PlaceSearchItem {
    id: number | null;
    externalApiId: string | null;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    thumbnailUrl: string | null;
    category: string | null;
}

export async function searchPlaces(query: string, signal?: AbortSignal) {
    if (!query.trim()) return [];
    const res = await api.get<PlaceSearchItem[]>('/api/places/search', {
        params: { query: query.trim() },
        timeout: 25000,
        signal,
    });
    if (!Array.isArray(res.data)) throw new Error('장소 검색 응답을 읽지 못했어요. 다시 검색해 주세요.');
    return res.data;
}
