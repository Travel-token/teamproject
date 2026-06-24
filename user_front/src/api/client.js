import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/config';

// ============================================================
// Spring Boot 백엔드와 통신하는 Axios 인스턴스
// ============================================================
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'tt_access_token';

// 요청 인터셉터: SecureStore에 저장된 JWT를 Authorization 헤더에 첨부
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // SecureStore 미지원 환경(웹 등)에서는 무시
  }
  return config;
});

// 응답 인터셉터: 401 등 공통 에러 처리 지점
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: 토큰 만료 처리 → 로그아웃 또는 리프레시 토큰 갱신
    }
    return Promise.reject(error);
  }
);

export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
