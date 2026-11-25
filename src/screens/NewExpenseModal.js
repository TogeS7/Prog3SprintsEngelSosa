import React, { useState, useCallback } from 'react';
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
  Modal,
} from 'react-native';
import { CameraView } from 'expo-camera';
import PrimaryButton from '../components/PrimaryButton';
import { useExpenses } from '../context/ExpensesContext';
import { CATEGORIES } from '../data/categories';
import { useReceiptPicker } from '../hooks/useReceiptPicker';
import { uploadReceipt } from '../services/cloudinary';
import { useQrScanner } from '../hooks/useQrScanner';

const NewExpenseModal = ({ navigation }) => {
  const { addExpense } = useExpenses();
  const { receiptUri, processing, takePhoto, pickFromGallery, clearReceipt } =
    useReceiptPicker();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].label);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleQrData = useCallback((parsed) => {
    if (parsed.title) setTitle(parsed.title);
    if (parsed.amount) setAmount(String(parsed.amount));
    if (parsed.notes) setNotes(parsed.notes);

    if (parsed.category) {
      const matched = CATEGORIES.find(
        (c) => c.label.toLowerCase() === parsed.category.toLowerCase()
      );
      if (matched) setCategory(matched.label);
    }

    Alert.alert(
      'QR leído',
      'Se completaron los datos disponibles en el formulario. Revisalos antes de guardar.'
    );
  }, []);

  const {
    isScannerOpen,
    openScannerWithPrePermission,
    closeScanner,
    handleBarcodeScanned,
  } = useQrScanner(handleQrData);

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

      <TouchableOpacity
        style={styles.qrButton}
        onPress={openScannerWithPrePermission}
        activeOpacity={0.8}
        disabled={uploading || processing}
      >
        <Text style={styles.qrButtonText}>📷 Escanear QR de factura / pago</Text>
      </TouchableOpacity>

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

      <Modal
        visible={isScannerOpen}
        animationType="slide"
        onRequestClose={closeScanner}
      >
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.scannerOverlay}>
            <Text style={styles.scannerHint}>
              Apuntá la cámara al código QR para autocompletar el gasto
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeScanner}>
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
    textAlign: 'center',
    color: '#333333',
  },
  qrButton: {
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  qrButtonText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 15,
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
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    alignItems: 'center',
    gap: 14,
  },
  scannerHint: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default NewExpenseModal;