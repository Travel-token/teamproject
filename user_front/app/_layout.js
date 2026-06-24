import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { TripProvider } from '../src/context/TripContext';
import Toast from '../src/components/common/Toast';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <TripProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="trip" />
              <Stack.Screen name="feed" />
              <Stack.Screen name="settle" />
            </Stack>
            <Toast />
          </TripProvider>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
