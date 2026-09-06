import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from "@react-native-async-storage/async-storage";
export const api = axios.create({
    baseURL: API_BASE_URL,
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
