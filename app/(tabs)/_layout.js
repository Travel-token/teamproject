import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize } from '../../src/constants/theme';

// 원본: 가운데 '메인홈' 탭은 떠 있는(floating) 원형 보라색 버튼으로 강조됨
function HomeTabIcon({ focused }) {
  return (
    <View style={styles.homeFab}>
      <Ionicons name="home" size={22} color={colors.white} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tp,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: '피드',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <HomeTabIcon focused={focused} />,
          tabBarLabel: () => <Text style={styles.homeLabel}>메인홈</Text>,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: '여행기록',
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={20} color={color} />,
        }}
      />
      {/* 프로필은 탭바에 노출하지 않고 홈 화면 우상단 아이콘으로만 진입 (원본 동작과 동일) */}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 78,
    paddingBottom: 12,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderTertiary,
    backgroundColor: colors.bgPrimary,
  },
  label: { fontSize: fontSize.sm },
  homeFab: {
    position: 'absolute',
    top: -18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.tp,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.bgPrimary,
    shadowColor: colors.tp,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  homeLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 20 },
});
