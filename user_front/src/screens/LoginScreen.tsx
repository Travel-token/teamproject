import React from "react";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { devLogin } from "../api/auth";
import { saveToken } from "../services/tokenService";
const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const handleGoogleLogin = () => {
        Alert.alert("소셜 로그인 앱 설정 후 사용할 수 있어요.");
    };
    const handleKakaoLogin = () => {
        Alert.alert("소셜 로그인 앱 설정 후 사용할 수 있어요.");
    };
    const handleNaverLogin = () => {
        Alert.alert("소셜 로그인 앱 설정 후 사용할 수 있어요.");
    };
    const handleTestLogin = async () => {
        try {
            const result = await devLogin("test@gmail.com");
            await saveToken(result.accessToken);
            navigation.replace("Tabs");
        }
        catch (error) {
            console.log(error);
            Alert.alert("로그인 실패");
        }
    };
    return (<View style={styles.container}>

            <Text style={styles.title}>
                Travel App
            </Text>

            <Text style={styles.subtitle}>
                여행을 시작해보세요!
            </Text>


            <TouchableOpacity style={styles.google} onPress={handleGoogleLogin}>

                <Text style={styles.text}>
                    Google 로그인
                </Text>

            </TouchableOpacity>



            <TouchableOpacity style={styles.kakao} onPress={handleKakaoLogin}>

                <Text style={styles.text}>
                    Kakao 로그인
                </Text>

            </TouchableOpacity>



            <TouchableOpacity style={styles.naver} onPress={handleNaverLogin}>

                <Text style={styles.text}>
                    Naver 로그인
                </Text>

            </TouchableOpacity>



            <TouchableOpacity style={styles.test} onPress={handleTestLogin}>

                <Text style={styles.text}>
                    개발자 테스트 로그인
                </Text>

            </TouchableOpacity>

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
