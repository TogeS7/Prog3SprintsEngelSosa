import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { useExpenses } from '../context/ExpensesContext';
import { CATEGORIES } from '../data/categories';
import { useReceiptPicker } from '../hooks/useReceiptPicker';
import { uploadReceipt } from '../services/cloudinary';

const NewExpenseModal = ({ navigation }) => {
  const { addExpense } = useExpenses();
  const { receiptUri, processing, takePhoto, pickFromGallery, clearReceipt } =
    useReceiptPicker();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].label);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (uploading || processing) return;

    const cleanTitle = String(title ?? '').trim();
    const numericAmount = Number(amount);

    if (!cleanTitle) {
      Alert.alert('Datos inválidos', 'El nombre del gasto es obligatorio.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Datos inválidos', 'El monto debe ser un número mayor a 0.');
      return;
    }

    setUploading(true);
    try {
      let receiptUrl = null;
      if (receiptUri) {
        receiptUrl = await uploadReceipt(receiptUri);
      }

      const result = await addExpense({
        title: cleanTitle,
        amount: numericAmount,
        category,
        notes,
        receiptUrl,
      });

      if (!result.ok) {
        Alert.alert('Datos inválidos', result.error);
        return;
      }

      setTitle('');
      setAmount('');
      setNotes('');
      clearReceipt();
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error al subir comprobante',
        error.message || 'No se pudo subir la imagen a Cloudinary.'
      );
    } finally {
      setUploading(false);
    }
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

      <Text style={styles.label}>Comprobante (opcional):</Text>
      <View style={styles.receiptActions}>
        <TouchableOpacity
          style={styles.receiptButton}
          onPress={takePhoto}
          disabled={uploading || processing}
        >
          <Text style={styles.receiptButtonText}>📷 Sacar foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.receiptButton}
          onPress={pickFromGallery}
          disabled={uploading || processing}
        >
          <Text style={styles.receiptButtonText}>🖼️ Galería</Text>
        </TouchableOpacity>
      </View>

      {processing ? (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.statusText}>Optimizando imagen...</Text>
        </View>
      ) : null}

      {receiptUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: receiptUri }} style={styles.previewImage} resizeMode="cover" />
          <TouchableOpacity
            style={styles.removeReceiptButton}
            onPress={clearReceipt}
            disabled={uploading}
          >
            <Text style={styles.removeReceiptText}>Quitar comprobante</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {uploading ? (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.statusText}>Subiendo comprobante...</Text>
        </View>
      ) : null}

      <PrimaryButton
        title={uploading ? 'Guardando...' : 'Guardar Gasto'}
        onPress={handleSave}
      />
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
  receiptActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  receiptButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  receiptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    color: '#475569',
  },
  previewContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 170,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  removeReceiptButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  removeReceiptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default NewExpenseModal;