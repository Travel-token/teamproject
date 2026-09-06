import * as ImagePicker from 'expo-image-picker';
import { api } from './client';
// 여행 사진
export interface TripPhoto {
    id: string;
    imageUrl: string;
    createdAt: string;
}
export async function fetchTripPhotos(tripId: string) {
    const res = await api.get<TripPhoto[]>(`/api/trips/${tripId}/photos`);
    return (res.data ?? []).map(item => ({ ...item, id: String(item.id) }));
}
export async function uploadTripPhoto(tripId: string, asset: ImagePicker.ImagePickerAsset) {
    const formData = new FormData();
    // 웹은 File 객체를 우선 사용
    const webAsset = asset as ImagePicker.ImagePickerAsset & {
        file?: File;
    };
    if (webAsset.file) {
        formData.append('file', webAsset.file);
    }
    else {
        formData.append('file', {
            uri: asset.uri,
            name: asset.fileName ?? `trip-photo-${Date.now()}.jpg`,
            type: asset.mimeType ?? 'image/jpeg',
        } as unknown as Blob);
    }
    const res = await api.post<TripPhoto>(`/api/trips/${tripId}/photos`, formData);
    return { ...res.data, id: String(res.data.id) };
}
