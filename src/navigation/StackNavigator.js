import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExpensesScreen from '../screens/ExpensesScreen';
import NewExpenseModal from '../screens/NewExpenseModal';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ExpensesList" 
        component={ExpensesScreen} 
        options={{ title: 'Mis Gastos' }}
      />
      <Stack.Screen 
        name="NewExpense" 
        component={NewExpenseModal} 
        options={{ title: 'Nuevo Gasto', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}