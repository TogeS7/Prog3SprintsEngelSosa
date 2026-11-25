# Uso de Dispositivos — ExpenseTracker (Sprint 4)

Proyecto elegido: **React Native (Expo)** en la rama `feature/sprint4-dispositivos`.

---

## Cámara y comprobantes

### Librería / API utilizada y por qué
[COMPLETAR CON THIAGO — Indicar si se usó `expo-image-picker` / `expo-image-manipulator` y por qué se eligió delegar la captura al sistema en lugar de armar una vista personalizada].

### Gestión de permisos
* **Cuándo se piden:** Just-in-time al tocar el botón de fotografiar comprobante, nunca al abrir la app.
* **Qué ve la persona usuaria:** Pre-Permission Dialog explicativo antes del diálogo del sistema.
* **Qué pasa si se rechazan:** Se ofrece elegir de la galería o guardar el gasto sin comprobante, y se permite abrir los ajustes del dispositivo (`Linking.openSettings()`).
* **Capturas:** `[Agregar capturas del flujo de permisos]`

### Optimización de imágenes antes de subir
* **Criterio:** Ancho máximo de `1200 px`, formato JPEG con compresión `0.6`, sin agrandar imágenes más chicas.
* **Comparativa de peso:**
  * Foto original: `[COMPLETAR CON THIAGO — ej. 2.8 MB]`
  * Foto optimizada: `[COMPLETAR CON THIAGO — ej. 240 KB]`

### Subida a Cloudinary y relación con Firestore
* Carga mediante `POST` con `FormData` y Upload Preset `unsigned` (`uploadReceipt`), sin exponer `API Key` ni `API Secret`.
* En Firestore (`expenses`) se almacena únicamente la `secure_url` en `receiptUrl` (`null` si no hay comprobante); en el listado se piden miniaturas (ej. `w_200,q_auto`) y en el detalle una versión mayor (ej. `w_800,q_auto`).

### Comportamiento sin conexión al guardar con comprobante
[COMPLETAR CON THIAGO — Documentar el aviso al usuario, el bloqueo de envíos duplicados y las opciones de reintentar o guardar sin comprobante].

---

## Sensor

### Sensor elegido y uso en ExpenseTracker
Elegimos **Lectura de QR** (`expo-camera` con `CameraView` y `onBarcodeScanned`) para escanear códigos QR de comprobantes o pagos desde `NewExpenseModal.js` y autocompletar campos como título, monto, categoría o notas.

### Librería / API utilizada y por qué
Se utilizó `expo-camera` (`useCameraPermissions` y `CameraView` configurado con `barcodeScannerSettings={{ barcodeTypes: ['qr'] }}`). Encapsulamos el estado y los permisos en `src/hooks/useQrScanner.js` y el parseo seguro (JSON o texto plano/URL) en `src/services/qrScanner.js` para mantener las pantallas desacopladas del hardware.

### Permisos requeridos y cómo se solicitan
Requiere permiso de cámara (`camera`). Se solicita de forma **just-in-time** únicamente cuando el usuario toca **"📷 Escanear QR de factura / pago"**:
1. Primero se muestra una alerta explicativa (*Pre-Permission Dialog*) indicando para qué se usará la cámara.
2. Solo si acepta, se llama a `requestPermission()`.
3. Si previamente denegó de forma permanente (`!canAskAgain`), se ofrece abrir la configuración del sistema mediante `Linking.openSettings()`.

### Tabla de compatibilidad

| Dispositivo / Entorno | Estado | Observaciones |
| :--- | :--- | :--- |
| `[Ej. Android con Expo Go]` | `[Funciona / Funciona parcialmente / No funciona]` | `[Completar con prueba real]` |
| `[Ej. iPhone con Expo Go]` | `[Funciona / Funciona parcialmente / No funciona]` | `[Completar con prueba real]` |
| `[Ej. Emulador / Web]` | `[Funciona / Funciona parcialmente / No funciona]` | `[Completar con prueba real]` |

### Cuando el sensor no está disponible o se rechaza el permiso
La aplicación sigue funcionando con normalidad: el gasto puede cargarse manualmente en `NewExpenseModal.js` sin que el escáner bloquee el formulario ni lance errores no controlados. Si el código QR no es JSON o viene incompleto, `parseQrExpenseData` lo interpreta como texto plano o URL de forma segura.

### Diferencias frente a la otra plataforma (PWA / Web)
En una PWA con React + Vite, el acceso directo a la cámara para leer QR en tiempo real depende de APIs web como `MediaDevices.getUserMedia` (y librerías de decodificación en JS) bajo contexto seguro **HTTPS**, con diferencias marcadas entre navegadores de escritorio, Android Chrome y Safari en iOS. En React Native con `expo-camera` se accede de forma nativa a la cámara trasera y a la lectura de códigos de barras/QR con una API unificada.

### Evidencias (capturas / video)
`[Agregar capturas o enlace/clip corto del escáner QR funcionando en dispositivo real]`