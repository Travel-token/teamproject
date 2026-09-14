import api from "./axios";
import { AuthSession } from "../services/authSession";
import { AppState, Linking } from 'react-native';


export const devLogin = async (email: string) => {

    const response = await api.post<AuthSession>(

        "/api/auth/dev-login",

        {
            email,
        }

    );

    return response.data;

};

export type SocialProvider = 'google' | 'kakao' | 'naver';

export async function socialLogin(provider: SocialProvider): Promise<AuthSession> {
    const callback = 'travelsettle://oauth';
    const { data } = await api.post<{ authorizationUrl: string }>(`/api/auth/oauth/${provider}/start`, { appRedirectUri: callback });
    return new Promise<AuthSession>((resolve, reject) => {
        let settled = false;
        const finish = (error?: unknown, session?: AuthSession) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            subscription.remove();
            appStateSubscription.remove();
            if (error) reject(error); else resolve(session!);
        };
        const handle = async ({ url }: { url: string }) => {
            if (!url.startsWith(callback)) return;
            const query = url.split('?')[1] ?? '';
            const values = Object.fromEntries(query.split('&').filter(Boolean).map(part => {
                const [key, value = ''] = part.split('=');
                return [decodeURIComponent(key), decodeURIComponent(value.replace(/\+/g, ' '))];
            }));
            if (values.error) return finish(new Error(values.error));
            if (!values.ticket) return finish(new Error('로그인 확인 코드를 받지 못했어요.'));
            try {
                const response = await api.post<AuthSession>('/api/auth/oauth/exchange', { ticket: values.ticket });
                finish(undefined, response.data);
            } catch (error) { finish(error); }
        };
        const subscription = Linking.addEventListener('url', event => { void handle(event); });
        // 일부 Android 브라우저는 기존 Activity를 재사용하면서 url 이벤트를 놓친다.
        // 앱이 다시 활성화될 때 현재 Intent URL도 확인한다.
        const appStateSubscription = AppState.addEventListener('change', state => {
            if (state === 'active') void Linking.getInitialURL().then(url => {
                if (url) void handle({ url });
            }).catch(() => undefined);
        });
        const timer = setTimeout(() => finish(new Error('로그인 시간이 만료됐어요. 다시 시도해 주세요.')), 5 * 60 * 1000);
        void Linking.openURL(data.authorizationUrl).catch(finish);
    });
}
