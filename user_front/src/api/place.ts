import { api } from './client';

export interface PlaceSearchItem {
    id: number;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    thumbnailUrl: string | null;
}

export async function searchPlaces(query: string) {
    const res = await api.get<PlaceSearchItem[]>('/api/places/search', {
        params: { query },
    });
    return res.data ?? [];
}