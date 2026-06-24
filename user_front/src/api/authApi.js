import { apiClient, saveToken, clearToken } from './client';

// ============================================================
// 인증 API
// Spring Boot 컨트롤러 예상 경로: /api/auth/**
// ============================================================

/**
 * 소셜 로그인 - provider별 OAuth access token을 백엔드로 전달하면
 * 백엔드가 자체 JWT를 발급하는 구조를 가정합니다.
 * 실제 OAuth 토큰 획득은 expo-auth-session 등으로 구현 후 이 함수에 전달하세요.
 *
 * POST /api/auth/login/{provider}
 * body: { providerToken }
 * response: { accessToken, user: { id, name, email, profileImage } }
 */
export async function loginWithProvider(providerKey, providerToken) {
  const { data } = await apiClient.post(`/auth/login/${providerKey}`, { providerToken });
  if (data?.accessToken) await saveToken(data.accessToken);
  return data;
}

/** POST /api/auth/logout */
export async function logout() {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    await clearToken();
  }
}

/** DELETE /api/users/me */
export async function withdrawUser() {
  try {
    await apiClient.delete('/users/me');
  } finally {
    await clearToken();
  }
}

/** PATCH /api/users/me - 닉네임, 프로필 등 수정 */
export async function updateProfile(payload) {
  const { data } = await apiClient.patch('/users/me', payload);
  return data;
}

/** PUT /api/users/me/account - 정산 받을 계좌 등록/수정 */
export async function updateSettlementAccount(payload) {
  const { data } = await apiClient.put('/users/me/account', payload);
  return data;
}
