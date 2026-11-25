import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useExpenses } from '../context/ExpensesContext';

export default function HomeScreen() {
  const { expenses } = useExpenses();

  const totalAmount = expenses.reduce((acc, item) => acc + Number(item.amount || 0), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ExpenseTracker</Text>
      <Text style={styles.subtitle}>Resumen de tus finanzas</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total gastado</Text>
        <Text style={styles.summaryAmount}>${totalAmount.toLocaleString('es-AR')}</Text>
        <Text style={styles.summaryCount}>
          Movimientos registrados: {expenses.length}
        </Text>
      </View>

      {expenses.length === 0 ? (
        <Text style={styles.emptyText}>Todavía no registraste gastos.</Text>
      ) : (
        <Text style={styles.description}>
          Entrá a la pestaña Gastos para ver el detalle o cargar nuevos movimientos.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 6 },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 24 },
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  summaryAmount: { fontSize: 32, fontWeight: 'bold', color: '#0F172A', marginVertical: 8 },
  summaryCount: { fontSize: 14, color: '#475569' },
  emptyText: { fontSize: 16, color: '#64748B', fontStyle: 'italic' },
  description: { fontSize: 15, textAlign: 'center', color: '#555', lineHeight: 22 },
});