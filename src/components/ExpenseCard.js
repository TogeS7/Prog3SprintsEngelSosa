import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { getCategoryMeta } from '../data/categories';

export default function ExpenseCard({ title, category, amount, onPress }) {
  const meta = getCategoryMeta(category);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.info}>
        <Text style={styles.title}>
          {meta.icon} {title}
        </Text>
        <Text style={[styles.category, { color: meta.color }]}>{category}</Text>
      </View>
      <Text style={styles.amount}>${Number(amount).toLocaleString('es-AR')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
});