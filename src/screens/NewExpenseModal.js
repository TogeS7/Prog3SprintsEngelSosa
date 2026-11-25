import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { useExpenses } from '../context/ExpensesContext';
import { CATEGORIES } from '../data/categories';

const NewExpenseModal = ({ navigation }) => {
  const { addExpense } = useExpenses();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].label);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    const result = addExpense({ title, amount, category, notes });

    if (!result.ok) {
      Alert.alert('Datos inválidos', result.error);
      return;
    }

    setTitle('');
    setAmount('');
    setNotes('');
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cargar Nuevo Gasto</Text>

      <Text style={styles.label}>Nombre del Gasto:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Supermercado"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Monto ($):</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 25000"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Categoría:</Text>
      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat.label;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                isSelected && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
              onPress={() => setCategory(cat.label)}
            >
              <Text style={[styles.categoryChipText, isSelected && { color: '#FFFFFF' }]}>
                {cat.icon} {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Notas (opcional):</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Compra semanal"
        value={notes}
        onChangeText={setNotes}
      />

      <PrimaryButton title="Guardar Gasto" onPress={handleSave} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
});

export default NewExpenseModal;