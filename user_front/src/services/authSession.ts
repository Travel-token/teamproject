import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';

export interface AuthSession {
    userId: number; name: string; sessionId: string;
    accessToken: string; refreshToken: string; accessExpiresAt: number; refreshExpiresAt: number;
}
type Revocation = { token: string; expiresAt: number };
type Stored = { session: AuthSession | null; pending: Revocation[] };
const KEY = 'travel.auth.v1';
// Browser sessions survive reloads within this tab. Native tokens stay in SecureStore.
async function readStored(): Promise<string | null> {
    if (Platform.OS !== 'web') return SecureStore.getItemAsync(KEY);
    return typeof window === 'undefined' ? null : window.sessionStorage.getItem(KEY);
}
async function writeStored(value: Stored): Promise<void> {
    const raw = JSON.stringify(value);
    if (Platform.OS !== 'web') return SecureStore.setItemAsync(KEY, raw);
    if (typeof window === 'undefined') throw new Error('브라우저에서 다시 로그인해 주세요.');
    window.sessionStorage.setItem(KEY, raw);
}
function validSession(value: unknown): value is AuthSession {
    const s = value as AuthSession | null;
    return !!s && Number.isFinite(s.userId) && typeof s.name === 'string'
        && typeof s.sessionId === 'string' && !!s.sessionId
        && typeof s.accessToken === 'string' && !!s.accessToken
        && typeof s.refreshToken === 'string' && !!s.refreshToken
        && Number.isFinite(s.accessExpiresAt) && Number.isFinite(s.refreshExpiresAt);
}
function parseStored(raw: string): Stored | null {
    try {
        const value = JSON.parse(raw) as Stored;
        if (!value || (value.session !== null && !validSession(value.session)) || !Array.isArray(value.pending)
            || !value.pending.every(item => item && typeof item.token === 'string' && Number.isFinite(item.expiresAt))) return null;
        return value;
    } catch { return null; }
}
const authHttp = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'ngrok-skip-browser-warning': 'true' },
});
let state: Stored = { session: null, pending: [] };
let loaded: Promise<void> | null = null;
let writes: Promise<unknown> = Promise.resolve();
let refreshPromise: Promise<AuthSession> | null = null;
let flushPromise: Promise<void> | null = null;
let epoch = 0;
const listeners = new Set<(session: AuthSession | null) => void>();
const emit = () => listeners.forEach(listener => listener(state.session));
export function subscribeSession(listener: (session: AuthSession | null) => void) {
    listeners.add(listener); return () => { listeners.delete(listener); };
}
async function load() {
    if (!loaded) loaded = (async () => {
        const raw = await readStored();
        if (raw !== null) {
            const restored = parseStored(raw);
            if (restored) state = restored;
            else {
                const empty = { session: null, pending: [] };
                await writeStored(empty);
                state = empty;
            }
        }
        // Previous access-only storage cannot restore a server-backed session.
        await AsyncStorage.removeItem('accessToken').catch(() => undefined);
    })().catch(error => { loaded = null; throw error; });
    await loaded;
}
async function mutate(update: (old: Stored) => Stored): Promise<void> {
    const next = writes.catch(() => undefined).then(async () => {
        await load();
        const value = update(state);
        await writeStored(value);
        state = value;
    });
    writes = next; await next;
}
export async function getSession(): Promise<AuthSession | null> { await load(); return state.session; }
export function isSameSession(sid: string) { return state.session?.sessionId === sid; }
export async function saveSession(session: AuthSession) {
    if (!validSession(session))
        throw new Error('서버에 세션 관리 코드를 먼저 적용해 주세요.');
    ++epoch;
    await mutate(old => ({ ...old, session }));
    emit();
    void flushRevocations().catch(() => undefined);
}
export async function forgetSession(queueRevocation = true) {
    ++epoch;
    await mutate(old => {
        const pending = old.pending.filter(item => item.expiresAt > Date.now());
        if (queueRevocation && old.session && !pending.some(item => item.token === old.session!.refreshToken))
            pending.push({ token: old.session.refreshToken, expiresAt: old.session.refreshExpiresAt });
        return { session: null, pending };
    });
    emit();
}
export async function flushRevocations(): Promise<void> {
    if (flushPromise) return flushPromise;
    const next = (async () => {
        await load();
        for (const item of [...state.pending]) {
            if (item.expiresAt > Date.now()) await authHttp.post('/api/auth/logout', { refreshToken: item.token });
            await mutate(old => ({ ...old, pending: old.pending.filter(p => p.token !== item.token) }));
        }
    })();
    flushPromise = next;
    try { await next; } finally { if (flushPromise === next) flushPromise = null; }
}
export async function refreshSession(rejectedAccessToken?: string): Promise<AuthSession> {
    const current = await getSession();
    if (!current) throw new Error('다시 로그인해 주세요.');
    if (rejectedAccessToken && rejectedAccessToken !== current.accessToken) return current;
    if (refreshPromise) return refreshPromise;
    const started = epoch;
    const next = (async () => {
        try {
            const { data } = await authHttp.post<AuthSession>('/api/auth/refresh', { refreshToken: current.refreshToken });
            if (started !== epoch || !isSameSession(current.sessionId)) throw new Error('로그인 계정이 변경되었습니다.');
            if (data.sessionId !== current.sessionId || !data.refreshToken || !data.accessToken || !Number.isFinite(data.accessExpiresAt))
                throw new Error('잘못된 세션 갱신 응답입니다.');
            await mutate(old => {
                if (started !== epoch || old.session?.sessionId !== current.sessionId) return old;
                return { ...old, session: data };
            });
            if (started !== epoch) throw new Error('로그인 계정이 변경되었습니다.');
            return data;
        } catch (error) {
            if (started === epoch && axios.isAxiosError(error) && error.response?.status === 401) await forgetSession();
            // Offline / 5xx is retryable: preserve the secure session and do not navigate to Login.
            throw error;
        }
    })();
    refreshPromise = next;
    try { return await next; } finally { if (refreshPromise === next) refreshPromise = null; }
}
export async function ensureAccessToken() {
    const session = await getSession();
    if (!session) return null;
    // The server is authoritative about expiry, including device clock skew.
    return session.accessExpiresAt > Date.now() + 30000 ? session.accessToken : (await refreshSession()).accessToken;
}
export async function logoutSession() {
    // One secure write records the revocation and clears the local session atomically.
    await forgetSession();
    try { await flushRevocations(); return true; } catch { return false; }
}
