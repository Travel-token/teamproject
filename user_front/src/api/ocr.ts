import * as ImagePicker from 'expo-image-picker';
import { api } from './client';
export interface ReceiptResult {
    name: string;
    amount: number;
    spentAt?: string;
    categoryCode?: string;
    confidence?: number;
}
export async function parseReceipt(tripId: string, asset: ImagePicker.ImagePickerAsset) {
    const form = new FormData();
    const web = asset as ImagePicker.ImagePickerAsset & {
        file?: File;
    };
    if (web.file)
        form.append('file', web.file);
    else
        form.append('file', { uri: asset.uri, name: asset.fileName ?? 'receipt.jpg', type: asset.mimeType ?? 'image/jpeg' } as unknown as Blob);
    return (await api.post<ReceiptResult>('/api/trips/' + tripId + '/receipts/parse', form, { timeout: 40000 })).data;
}
