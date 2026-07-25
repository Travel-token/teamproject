import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";


// TODO: 실제 배포 주소로 교체 (개발 중엔 PC의 로컬 IP, 예: http://192.168.0.5:8080/api)
export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

// 이미 로그인 로직에서 토큰을 다른 키/방식(AsyncStorage 등)으로 저장하고 있다면
// 이 부분만 그 방식에 맞게 바꿔주세요. (키 이름: 'accessToken' 가정)
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}