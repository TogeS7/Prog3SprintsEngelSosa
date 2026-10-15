import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

const NewExpenseModal = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleSave = () => {
    if (!name || !category || !amount) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }

    console.log('Nuevo Gasto Registrado:', { name, category, amount });
    Alert.alert(
      'Gasto Registrado',
      `Nombre: ${name}\nCategoría: ${category}\nMonto: $${amount}`
    );

    // Limpiar formulario
    setName('');
    setCategory('');
    setAmount('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cargar Nuevo Gasto</Text>

      <Text style={styles.label}>Nombre del Gasto:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Supermercado"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Categoría:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Alimentos"
        value={category}
        onChangeText={setCategory}
      />

      <Text style={styles.label}>Monto ($):</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 5000"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <PrimaryButton title="Guardar Gasto" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default NewExpenseModal;