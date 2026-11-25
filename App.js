import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ExpensesProvider, useExpenses } from './src/context/ExpensesContext';
import TabNavigator from './src/navigation/TabNavigator';

function RootNavigator() {
  const { isLoaded } = useExpenses();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ExpensesProvider>
      <RootNavigator />
    </ExpensesProvider>
  );
}