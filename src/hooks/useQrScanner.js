import { useState, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { parseQrExpenseData } from '../services/qrScanner';

export function useQrScanner(onDataParsed) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const openScannerWithPrePermission = useCallback(() => {
    if (!permission) {
      Alert.alert(
        'Cámara no disponible',
        'No se pudo verificar el estado de la cámara en este dispositivo. Podés completar los datos del gasto manualmente.'
      );
      return;
    }

    if (permission.granted) {
      setHasScanned(false);
      setIsScannerOpen(true);
      return;
    }

    if (!permission.canAskAgain) {
      Alert.alert(
        'Permiso de cámara desactivado',
        'Necesitás habilitar el permiso de cámara desde los ajustes del dispositivo para escanear códigos QR. Podés seguir cargando el gasto a mano.',
        [
          { text: 'Seguir sin QR', style: 'cancel' },
          { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    Alert.alert(
      'Permiso para escanear QR',
      'Usamos la cámara para leer códigos QR de comprobantes o pagos y autocompletar campos del gasto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: async () => {
            const result = await requestPermission();
            if (result?.granted) {
              setHasScanned(false);
              setIsScannerOpen(true);
            } else {
              Alert.alert(
                'Permiso denegado',
                'No pasa nada: podés completar el formulario manualmente o activar el permiso más adelante en ajustes.'
              );
            }
          },
        },
      ]
    );
  }, [permission, requestPermission]);

  const closeScanner = useCallback(() => {
    setHasScanned(false);
    setIsScannerOpen(false);
  }, []);

  const handleBarcodeScanned = useCallback(
    ({ data }) => {
      if (hasScanned) return;
      setHasScanned(true);
      const parsed = parseQrExpenseData(data);
      setIsScannerOpen(false);
      if (typeof onDataParsed === 'function') {
        onDataParsed(parsed);
      }
    },
    [hasScanned, onDataParsed]
  );

  return {
    isScannerOpen,
    permission,
    openScannerWithPrePermission,
    closeScanner,
    handleBarcodeScanned,
  };
}