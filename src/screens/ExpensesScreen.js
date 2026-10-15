import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ExpenseCard from '../components/ExpenseCard';

const mockExpenses = [
  { id: '1', name: 'Supermercado', category: 'Alimentos', amount: '25000' },
  { id: '2', name: 'Combustible', category: 'Transporte', amount: '12000' },
  { id: '3', name: 'Internet', category: 'Servicios', amount: '8500' },
];

const ExpensesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de Gastos</Text>
      <FlatList
        data={mockExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseCard
            name={item.name}
            category={item.category}
            amount={item.amount}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default ExpensesScreen;