import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, Pressable, View } from 'react-native';
import { getSession, subscribeSession, flushRevocations } from '../services/authSession';
import { resumeIntegrations, stopIntegrations } from '../services/integrationLifecycle';
import { useTheme } from '../theme/ThemeContext';
import FeedDetailScreen from '../screens/FeedDetailScreen';
import FeedCreateScreen from '../screens/FeedCreateScreen';
import MyFeedListScreen from '../screens/MyFeedListScreen';
import FeedEditScreen from '../screens/FeedEditScreen';
import RoomExpenseScreen from '../screens/RoomExpenseScreen';
import RoomMapScreen from '../screens/RoomMapScreen';
import RoomSettleScreen from '../screens/RoomSettleScreen';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';

import LoginScreen from '../screens/LoginScreen';
import { navigationRef, flushPendingPush } from './pushNavigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { colors, isDark } = useTheme();
    const [signedIn, setSignedIn] = useState<boolean | null>(null);
    const [storageError, setStorageError] = useState(false);
    const boot = () => {
        setStorageError(false);
        void getSession().then(session => { setSignedIn(!!session); if (session) resumeIntegrations(); else void stopIntegrations().catch(() => undefined); })
            .catch(() => setStorageError(true));
        void flushRevocations().catch(() => undefined);
    };
    useEffect(() => {
        const unsubscribe = subscribeSession(session => {
            setSignedIn(!!session);
            if (session) resumeIntegrations();
            else { void stopIntegrations().catch(() => undefined); }
        });
        boot();
        return unsubscribe;
    }, []);
    if (storageError) return <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}><Text>안전한 로그인 저장소를 읽지 못했어요.</Text><Pressable onPress={boot}><Text>다시 시도</Text></Pressable></View>;
    if (signedIn === null) return <ActivityIndicator style={{ flex: 1 }} />;

    const navTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            background: colors.bgScreen,
            card: colors.bgScreen,
            text: colors.txPrimary,
            border: colors.bdCard,
        },
    };

    return (
        <NavigationContainer ref={navigationRef} theme={navTheme}
            onReady={() => { void flushPendingPush().catch(() => undefined); }}
            onStateChange={() => { void flushPendingPush().catch(() => undefined); }}>


            <Stack.Navigator key={signedIn ? "member" : "guest"} screenOptions={{ headerShown: false }}>
                {signedIn ? <>
                    <Stack.Screen name="Tabs" component={TabNavigator} />
                    <Stack.Screen name="FeedDetail" component={FeedDetailScreen} />
                    <Stack.Screen name="FeedCreate" component={FeedCreateScreen} />
                    <Stack.Screen name="MyFeedList" component={MyFeedListScreen} />
                    <Stack.Screen name="FeedEdit" component={FeedEditScreen} />
                    <Stack.Screen name="RoomExpense" component={RoomExpenseScreen} />
                    <Stack.Screen name="RoomSettle" component={RoomSettleScreen} />
                    <Stack.Screen name="RoomMap" component={RoomMapScreen} />
                </> : <Stack.Screen name="Login" component={LoginScreen} />}
            </Stack.Navigator>


        </NavigationContainer>
    );
}
