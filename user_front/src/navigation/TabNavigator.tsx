import { FontAwesome6 } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import FeedScreen from '../screens/FeedScreen';
import MyPageScreen from '../screens/MyPageScreen';
import SettleHomeScreen from '../screens/SettleHomeScreen';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, React.ComponentProps<typeof FontAwesome6>['name']> = {
  Feed: 'table-cells-large',
  Settle: 'wallet',
  MyPage: 'clock-rotate-left',
};

const LABELS: Record<keyof TabParamList, string> = {
  Feed: '피드',
  Settle: '정산',
  MyPage: '여행기록',
};

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.txPrimary,
        tabBarInactiveTintColor: colors.navIconInactive,
        tabBarStyle: {
          backgroundColor: colors.bgScreen,
          borderTopColor: colors.bdNav,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <FontAwesome6 name={ICONS[route.name as keyof TabParamList]} size={size * 0.8} color={color} />
        ),
        tabBarLabel: LABELS[route.name as keyof TabParamList],
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Settle" component={SettleHomeScreen} />
      <Tab.Screen name="MyPage" component={MyPageScreen} />
    </Tab.Navigator>
  );
}
