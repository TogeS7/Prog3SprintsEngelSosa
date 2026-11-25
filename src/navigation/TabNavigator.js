import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import StackNavigator from './StackNavigator';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused }) => {
          let emoji = '📌';

          if (route.name === 'Inicio') {
            emoji = '🏠';
          } else if (route.name === 'Gastos') {
            emoji = '💸';
          } else if (route.name === 'Ajustes') {
            emoji = '⚙️';
          }

          return (
            <Text
              style={{
                fontSize: focused ? 20 : 18,
                opacity: focused ? 1 : 0.75,
              }}
            >
              {emoji}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Gastos" component={StackNavigator} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
  );
}