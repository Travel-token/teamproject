import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api';
import { ensureAccessToken, getSession, isSameSession, refreshSession, forgetSession } from '../services/authSession';
type SessionRequest = InternalAxiosRequestConfig & { _sessionId?: string; _sentToken?: string; _authRetry?: boolean };
export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'ngrok-skip-browser-warning': 'true' },
});
api.interceptors.request.use(async config => {
    const request = config as SessionRequest;
    if (request._sessionId && !isSameSession(request._sessionId)) throw new axios.CanceledError('계정이 변경되었습니다.');
    const token = await ensureAccessToken();
    const session = await getSession();
    if (!token || !session) throw new axios.CanceledError('다시 로그인해 주세요.');
    if (request._sessionId && request._sessionId !== session.sessionId) throw new axios.CanceledError('계정이 변경되었습니다.');
    request._sessionId = session.sessionId;
    request._sentToken = token;
    request.headers.Authorization = 'Bearer ' + token;
    return request;
});
api.interceptors.response.use(response => {
    const request = response.config as SessionRequest;
    if (request._sessionId && !isSameSession(request._sessionId)) throw new axios.CanceledError('계정이 변경되었습니다.');
    return response;
}, async error => {
    const request = error.config as SessionRequest | undefined;
    if (error.response?.status !== 401 || !request || !request._sessionId || !isSameSession(request._sessionId)) throw error;
    if (request._authRetry) { await forgetSession(); throw error; }
    request._authRetry = true;
    await refreshSession(request._sentToken);
    if (!isSameSession(request._sessionId)) throw new axios.CanceledError('계정이 변경되었습니다.');
    return api.request(request);
});
export interface ApiResponse<T> { success: boolean; data: T; message?: string }
