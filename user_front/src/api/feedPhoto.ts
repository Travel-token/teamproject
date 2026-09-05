import * as ImagePicker from 'expo-image-picker';
import { api } from './client';
export async function uploadFeedPhoto(asset: ImagePicker.ImagePickerAsset) {
    const form = new FormData();
    const web = asset as ImagePicker.ImagePickerAsset & {
        file?: File;
    };
    if (web.file)
        form.append('file', web.file);
    else
        form.append('file', { uri: asset.uri, name: asset.fileName ?? 'photo.jpg', type: asset.mimeType ?? 'image/jpeg' } as unknown as Blob);
    return (await api.post<{
        url: string;
    }>('/api/feed-photos', form)).data.url;
}
