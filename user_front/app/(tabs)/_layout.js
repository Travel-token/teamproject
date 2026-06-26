import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false, 
        tabBarIconStyle: styles.iconStyle,
        tabBarBackground: () => (
          <BlurView 
            tint="light" 
            intensity={70} 
            style={StyleSheet.absoluteFill} 
          />
        ),
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.homeButton, focused ? styles.homeActive : styles.homeInactive]}>
              <Ionicons name="home" size={22} color={focused ? colors.black : colors.textTertiary} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={22} color={color} />,
        }}
      />

      <Tabs.Screen 
        name="profile" 
        options={{ href: null }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 50,
    right: 50,
    bottom: 28,
    
    // 1. 요청하신 67 높이 지정
    height: 67, 
    // 2. 완벽한 라운드 캡슐 형태를 유지하여 양 끝 깨짐을 방지 (67 / 2 = 33.5)
    borderRadius: 33.5, 
    
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    
    // 3. 안드로이드 기기에서 BlurView 내부가 바깥으로 터져서 사각형으로 깨지는 버그 차단
    overflow: 'hidden', 
  },
  iconStyle: {
    // 4. 높이가 커져도 세 개 아이콘의 중심축이 완벽히 수직 중앙에 일치하도록 고정
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  homeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  homeActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)', 
  },
  homeInactive: {
    backgroundColor: 'transparent',
  },
});