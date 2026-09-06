import axios from 'axios';

// ─────────────────────────────────────────────
// OCR 서비스 주소
// 시연 단계에서는 Spring을 거치지 않고 Python OCR 서비스를 직접 호출한다.
// 실기기(폰)로 테스트할 때는 localhost가 아니라 PC의 IP를 써야 한다.
//   1) PC에서 ipconfig 실행 -> IPv4 주소 확인
//   2) 폰과 PC가 같은 와이파이인지 확인
//   3) 아래 IP를 그 주소로 변경
// ─────────────────────────────────────────────
const OCR_BASE_URL = 'http://172.21.85.40:8001';

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
 * @param imageUri expo-image-picker가 돌려준 로컬 파일 URI
 */
export async function extractReceipt(imageUri: string): Promise<OcrResult> {
  const formData = new FormData();

  const fileName = imageUri.split('/').pop() ?? 'receipt.jpg';
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  // React Native의 FormData는 { uri, name, type } 형태를 요구한다 (웹과 다름)
  formData.append('image', {
    uri: imageUri,
    name: fileName,
    type: mimeType,
  } as any);

  const res = await axios.post<OcrResult>(`${OCR_BASE_URL}/ocr`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // CPU 추론이라 느릴 수 있음. 첫 요청은 모델 로딩까지 포함
  });

  return res.data;
}

/** OCR 서비스가 살아있는지 확인 (선택) */
export async function checkOcrHealth(): Promise<boolean> {
  try {
    await axios.get(`${OCR_BASE_URL}/health`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
