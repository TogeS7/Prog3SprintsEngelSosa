import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useExpenses } from '../context/ExpensesContext';
import { getCategoryMeta } from '../data/categories';
import { getReceiptThumbnail } from '../services/cloudinary';

export default function ExpenseDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { expenses, removeExpense } = useExpenses();

  const expense = expenses.find((item) => item.id === id);

  if (!expense) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Gasto no encontrado.</Text>
      </View>
    );
  }

  const meta = getCategoryMeta(expense.category);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar gasto',
      `¿Seguro que querés eliminar "${expense.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            removeExpense(expense.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{expense.title}</Text>
        <Text style={styles.amount}>${Number(expense.amount).toLocaleString('es-AR')}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Categoría:</Text>
          <Text style={[styles.value, { color: meta.color, fontWeight: '700' }]}>
            {meta.icon} {expense.category}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Notas:</Text>
          <Text style={styles.value}>{expense.notes || 'Sin notas'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>
            {new Date(expense.createdAt).toLocaleString('es-AR')}
          </Text>
        </View>

        {expense.receiptUrl ? (
          <View style={styles.row}>
            <Text style={styles.label}>Comprobante:</Text>
            <Image
              source={{ uri: getReceiptThumbnail(expense.receiptUrl, 800) }}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </View>
        ) : null}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Eliminar gasto</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  amount: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 20 },
  row: { marginBottom: 12 },
  label: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  value: { fontSize: 16, color: '#1E293B', marginTop: 2 },
  receiptImage: {
    width: '100%',
    height: 280,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#F1F5F9',
  },
  deleteButton: {
    marginTop: 24,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  notFound: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#64748B' },
});