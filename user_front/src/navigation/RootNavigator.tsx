import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import FeedDetailScreen from '../screens/FeedDetailScreen';
import RoomExpenseScreen from '../screens/RoomExpenseScreen';
import RoomMapScreen from '../screens/RoomMapScreen';
import RoomSettleScreen from '../screens/RoomSettleScreen';
import TabNavigator from './TabNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { colors, isDark } = useTheme();

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
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="FeedDetail" component={FeedDetailScreen} />
        <Stack.Screen name="RoomExpense" component={RoomExpenseScreen} />
        <Stack.Screen name="RoomSettle" component={RoomSettleScreen} />
        <Stack.Screen name="RoomMap" component={RoomMapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
