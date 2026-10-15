import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ExpenseTracker</Text>
      <Text style={styles.subtitle}>¡Te damos la bienvenida!</Text>
      <Text style={styles.description}>
        Esta aplicación te ayudará a llevar un registro detallado de tus gastos personales para mejorar tus finanzas.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  subtitle: { fontSize: 20, fontWeight: '600', marginBottom: 15 },
  description: { fontSize: 16, textAlign: 'center', color: '#555', lineHeight: 24 },
});