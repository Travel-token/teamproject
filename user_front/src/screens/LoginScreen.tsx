import React, { useState } from "react";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import { devLogin, socialLogin, SocialProvider } from "../api/auth";
import { saveSession } from "../services/authSession";
import { resumeIntegrations, integrationTick } from '../services/integrationLifecycle';
import axios from 'axios';
import { apiError } from '../utils/apiError';
const LoginScreen = () => {
    const showDevLogin = process.env.EXPO_PUBLIC_ENABLE_DEV_LOGIN === 'true';
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const handleSocialLogin = async (provider: SocialProvider) => {
        if (busy) return; setBusy(true);
        try {
            const result = await socialLogin(provider);
            await saveSession(result);
            resumeIntegrations();
            void integrationTick().catch(() => undefined);
        } catch (error) {
            Alert.alert('로그인 실패', apiError(error, '소셜 로그인을 완료하지 못했어요.'));
        } finally { setBusy(false); }
    };
    const [email, setEmail] = useState("test@gmail.com");
    const [busy, setBusy] = useState(false);
    const handleTestLogin = async () => {
        if (busy) return; setBusy(true);
        try {
            const result = await devLogin(email.trim());
            await saveSession(result);
            resumeIntegrations();
            // RootNavigator changes to Tabs when saveSession emits the new session.
            void integrationTick().catch(() => console.warn('로그인 후 기기 연동을 다음 주기에 다시 시도합니다.'));
        }
        catch (error) {
            // Do not log Axios errors; they may contain tokens.
            const message = axios.isAxiosError(error) && error.response?.status === 404
                ? '개발 로그인 API가 비활성 상태예요. 서버의 AUTH_DEV_LOGIN_ENABLED 설정을 확인해 주세요.'
                : apiError(error, '로그인 요청을 처리하지 못했어요. 서버 연결과 실행 상태를 확인해 주세요.');
            Alert.alert("로그인 실패", message);
        }
        finally { setBusy(false); }
    };
    return (<View style={styles.container}>

        <Text style={styles.title}>
            Travel App
        </Text>

        <Text style={styles.subtitle}>
            여행을 시작해보세요!
        </Text>


        <TouchableOpacity disabled={busy} style={styles.google} onPress={() => void handleSocialLogin('google')}>

            <Text style={styles.text}>
                Google 로그인
            </Text>

        </TouchableOpacity>



        <TouchableOpacity disabled={busy} style={styles.kakao} onPress={() => void handleSocialLogin('kakao')}>

            <Text style={styles.text}>
                Kakao 로그인
            </Text>

        </TouchableOpacity>



        <TouchableOpacity disabled={busy} style={styles.naver} onPress={() => void handleSocialLogin('naver')}>

            <Text style={styles.text}>
                Naver 로그인
            </Text>

        </TouchableOpacity>



        {showDevLogin && <><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="개발 테스트 계정 이메일" style={{ borderWidth: 1, padding: 12, marginBottom: 12 }} /><TouchableOpacity disabled={busy} style={styles.test} onPress={handleTestLogin}>

            <Text style={styles.text}>
                개발자 테스트 로그인
            </Text>

        </TouchableOpacity></>}

    </View>);
};
export default LoginScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 30,
        backgroundColor: "#FFFFFF"
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 50
    },
    google: {
        backgroundColor: "#4285F4",
        padding: 16,
        borderRadius: 10,
        marginBottom: 15
    },
    kakao: {
        backgroundColor: "#FEE500",
        padding: 16,
        borderRadius: 10,
        marginBottom: 15
    },
    naver: {
        backgroundColor: "#03C75A",
        padding: 16,
        borderRadius: 10,
        marginBottom: 30
    },
    test: {
        backgroundColor: "#444",
        padding: 16,
        borderRadius: 10
    },
    text: {
        textAlign: "center",
        color: "#FFF",
        fontWeight: "bold"
    }
});
