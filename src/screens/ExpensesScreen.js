import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useExpenses } from '../context/ExpensesContext';
import ExpenseCard from '../components/ExpenseCard';
import PrimaryButton from '../components/PrimaryButton';

const ExpensesScreen = ({ navigation }) => {
  const { expenses } = useExpenses();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Listado de Gastos</Text>
        <PrimaryButton
          title="+ Nuevo Gasto"
          onPress={() => navigation.navigate('NewExpense')}
        />
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseCard
            title={item.title}
            category={item.category}
            amount={item.amount}
            receiptUrl={item.receiptUrl}
            onPress={() => navigation.navigate('ExpenseDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Todavía no registraste gastos.</Text>
        }
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
  header: {
    marginBottom: 16,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#64748B',
  },
});

export default ExpensesScreen;