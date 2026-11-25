import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

async function getFileSizeKB(uri) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return (blob.size / 1024).toFixed(1);
  } catch {
    return null;
  }
}

async function optimizeImage(asset) {
  const actions =
    asset.width && asset.width > 1200 ? [{ resize: { width: 1200 } }] : [];

  const result = await ImageManipulator.manipulateAsync(asset.uri, actions, {
    compress: 0.6,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  const beforeKB = await getFileSizeKB(asset.uri);
  const afterKB = await getFileSizeKB(result.uri);
  if (beforeKB && afterKB) {
    console.log(
      `[Comprobante] Original: ${beforeKB} KB -> Optimizada: ${afterKB} KB`
    );
  }

  return result.uri;
}

function askCameraExplanation() {
  return new Promise((resolve) => {
    Alert.alert(
      'Acceso a la cámara',
      'Necesitamos usar la cámara para fotografiar el ticket o comprobante y guardarlo junto al gasto.',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continuar', onPress: () => resolve(true) },
      ]
    );
  });
}

export function useReceiptPicker() {
  const [receiptUri, setReceiptUri] = useState(null);
  const [processing, setProcessing] = useState(false);

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]) return;

      setProcessing(true);
      const optimizedUri = await optimizeImage(result.assets[0]);
      setReceiptUri(optimizedUri);
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar la imagen de la galería.');
    } finally {
      setProcessing(false);
    }
  };

  const takePhoto = async () => {
    try {
      const current = await ImagePicker.getCameraPermissionsAsync();

      if (!current.granted) {
        const accepted = await askCameraExplanation();
        if (!accepted) return;

        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Permiso de cámara rechazado',
            'Podés elegir el comprobante desde tu galería o habilitar la cámara desde los ajustes del teléfono.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Elegir de galería', onPress: pickFromGallery },
              { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]) return;

      setProcessing(true);
      const optimizedUri = await optimizeImage(result.assets[0]);
      setReceiptUri(optimizedUri);
    } catch {
      Alert.alert('Error', 'No se pudo abrir la cámara en este dispositivo.');
    } finally {
      setProcessing(false);
    }
  };

  const clearReceipt = () => setReceiptUri(null);

  return {
    receiptUri,
    processing,
    takePhoto,
    pickFromGallery,
    clearReceipt,
  };
}
