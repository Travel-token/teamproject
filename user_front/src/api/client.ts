import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";


export const api = axios.create({
  baseURL: 'http://172.21.85.40:8080',
  timeout: 10000,
});

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