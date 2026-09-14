import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';
import { api } from './client';

// ─────────────────────────────────────────────
// Android는 OCR 서버에 직접 연결하지 않는다.
// 인증된 Spring API가 파일 검증 후 PC 내부의 OCR 서버로 전달한다.
// ─────────────────────────────────────────────
export interface OcrResult {
  name: string | null;
  amount: number | null;
  spentAt: string | null;      // "2026-04-06 15:15:00"
  categoryCode: string | null; // meal | ticket | cafe | shop | trans
  confidence: {
    name: number;
    amount: number;
    spent_at: number;
    category_code: number;
  };
}

/**
 * 영수증 이미지를 OCR 서비스에 보내 지출 정보를 추출한다.
 * @param asset expo-image-picker가 돌려준 사진 (웹에서는 File 포함)
 */
export async function extractReceipt(tripId: string, asset: ImagePickerAsset, signal?: AbortSignal): Promise<OcrResult> {
  if (!tripId) throw new Error('여행을 선택한 후 영수증을 인식해 주세요.');
  const formData = new FormData();

  const fileName = asset.fileName || asset.uri.split('/').pop()?.split('?')[0] || 'receipt.jpg';
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = asset.mimeType || (ext === 'png' ? 'image/png' : 'image/jpeg');

  if (Platform.OS === 'web') {
    const webFile = (asset as ImagePickerAsset & { file?: File }).file;
    if (webFile) formData.append('file', webFile, webFile.name);
    else {
      const response = await fetch(asset.uri);
      if (!response.ok) throw new Error('선택한 사진을 읽지 못했어요. 다시 선택해 주세요.');
      formData.append('file', await response.blob(), fileName);
    }
  } else {
    formData.append('file', { uri: asset.uri, name: fileName, type: mimeType } as unknown as Blob);
  }

  const res = await api.post<OcrResult>(`/api/trips/${encodeURIComponent(tripId)}/receipts/parse`, formData, {
    signal,
    timeout: 300000, // Windows CPU OCR은 고해상도 영수증에서 3분을 넘길 수 있음
  });

  return res.data;
}

