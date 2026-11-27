# Estrategia de Persistencia de Datos — ExpenseTracker (React Native / Expo)

**Repositorio:** `[https://github.com/TogeS7/Prog3SprintsEngelSosa](https://github.com/TogeS7/Prog3SprintsEngelSosa)`  
**Integrantes:** Thiago Engel y Juan Cruz Sosa  
**Stack:** React Native, Expo SDK, Cloud Firestore, AsyncStorage

---

## 1. Arquitectura por Capas y Separación de Responsabilidades

La aplicación implementa una arquitectura desacoplada en tres capas para evitar que los componentes visuales dependan directamente del motor de almacenamiento:

1. **Capa de Presentación (`src/screens/`, `src/components/`):**  
   Pantallas (`ExpensesScreen`, `NewExpenseModal`, `ExpenseDetailScreen`) y componentes reutilizables (`ExpenseCard`, `PrimaryButton`). Consumen estado y funciones desde el contexto sin conocer si los datos provienen del almacenamiento local del dispositivo o de la nube.
2. **Capa de Estado y Lógica de Negocio (`src/context/ExpensesContext.js`):**  
   Centraliza el estado global de gastos y configuraciones, gestiona el ciclo de hidratación inicial, valida entradas de usuario y coordina las operaciones CRUD (`addExpense`, `updateExpense`, `deleteExpense`).
3. **Capa de Acceso a Datos (`src/services/firebase.js` y `@react-native-async-storage/async-storage`):**  
   Encapsula la inicialización de Firebase/Firestore y la lectura/escritura asíncrona en el almacenamiento persistente del dispositivo.

### Distribución de datos: AsyncStorage vs. Cloud Firestore

| Tipo de dato | Medio de persistencia | Justificación arquitectónica |
| :--- | :--- | :--- |
| **Gastos (`expenses`)**: `title`, `amount`, `category`, `notes`, `createdAt`, `updatedAt` | **Cloud Firestore** (Nube) | Constituyen el dominio compartido del negocio. Al residir en Firestore, los registros se sincronizan en tiempo real entre el cliente móvil (Expo) y el cliente web (PWA) bajo el mismo proyecto y esquema de documentos. |
| **Preferencias locales**: filtro de categoría activo, criterio de ordenamiento y ajustes de interfaz | **AsyncStorage** (Local en dispositivo) | Son configuraciones específicas de la sesión y preferencias visuales del dispositivo. Mantenerlas en almacenamiento local evita escrituras innecesarias en la nube, reduce consumo de red y garantiza respuesta instantánea al abrir la app. |

---

## 2. Patrón de Hidratación y Uso de la Bandera `isLoaded`

Dado que tanto la lectura desde `AsyncStorage` como la suscripción inicial a Cloud Firestore son operaciones **asíncronas**, renderizar o ejecutar efectos de guardado antes de completar la carga provocaría sobrescribir datos existentes con un estado vacío o mostrar parpadeos inconsistentes en la interfaz.

Para resolverlo, `ExpensesContext.js` implementa el patrón de hidratación controlado mediante el estado booleano `isLoaded`:

1. **Estado inicial (`isLoaded = false`):** Al montar el proveedor, las pantallas muestran un indicador de carga (`ActivityIndicator`) en lugar de una lista vacía.
2. **Fase de hidratación (`useEffect` de montaje):** Se leen las preferencias almacenadas en `AsyncStorage` mediante `AsyncStorage.getItem(...)` y se registra el listener de Firestore.
3. **Activación (`setIsLoaded(true)`):** Una vez resuelta la lectura inicial, `isLoaded` pasa a `true`.
4. **Protección contra escritura prematura:** Los `useEffect` encargados de persistir cambios en `AsyncStorage` incluyen una guarda explícita al inicio:
   ```javascript
   useEffect(() => {
     if (!isLoaded) return;
     AsyncStorage.setItem('@expense_tracker_prefs', JSON.stringify(preferences));
   }, [preferences, isLoaded]);
   ```
   De este modo, ningún cambio se persiste en disco hasta que la hidratación haya finalizado por completo.

---

## 3. Sincronización en Tiempo Real con Cloud Firestore

La comunicación con la base de datos remota se realiza mediante suscripciones reactivas usando `onSnapshot` sobre la colección `expenses`:

```javascript
const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
const unsubscribe = onSnapshot(
  q,
  (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setExpenses(items);
    setIsLoaded(true);
  },
  (error) => {
    console.error('Error en suscripción de Firestore:', error);
    setIsLoaded(true);
  }
);
```

* **Actualización bidireccional instantánea:** Cuando se crea, edita o elimina un gasto desde la PWA o desde otro dispositivo móvil, Firestore dispara el evento `onSnapshot` y actualiza el estado de React Native automáticamente sin necesidad de recargar manualmente.
* **Limpieza de recursos:** El retorno del `useEffect` ejecuta `unsubscribe()` al desmontar el contexto, evitando fugas de memoria y listeners duplicados.
* **Configuración segura:** Las credenciales de Firebase se inyectan exclusivamente mediante variables de entorno (`EXPO_PUBLIC_FIREBASE_*`) declaradas en `.env` (excluido del repositorio) y documentadas en `.env.example`.

---

## 4. Resultados de Pruebas sin Conexión (Modo Offline)

Se ejecutaron pruebas funcionales activando el **Modo Avión** en el dispositivo físico con Expo Go:

| Escenario probado | Comportamiento observado | Resultado |
| :--- | :--- | :--- |
| **1. Alta de gasto sin conexión** | Al guardar un nuevo gasto con el teléfono en Modo Avión, el SDK de Firestore encola la escritura localmente y actualiza la interfaz de forma optimista sin arrojar errores de red. | **Aprobado** |
| **2. Persistencia tras cerrar la app** | Al cerrar completamente Expo Go y volver a abrirlo, `AsyncStorage` hidrata las preferencias locales de forma inmediata sin pérdida de estado. | **Aprobado** |
| **3. Reconexión y sincronización** | Al desactivar el Modo Avión, Firestore sincroniza automáticamente la cola de operaciones pendientes con la nube y refleja los cambios en la PWA en segundos. | **Aprobado** |

---

## 5. Comparativa Técnica: React Native (Expo) vs. PWA (React Web)

| Criterio | React Native (Expo) | PWA (React Web) |
| :--- | :--- | :--- |
| **Almacenamiento local de preferencias** | `AsyncStorage` (API asíncrona basada en promesas y almacenamiento nativo). | `localStorage` (API síncrona clave-valor del navegador). |
| **Caché offline de Firestore** | Caché en memoria durante el ciclo de vida de la sesión en Expo Go. | Persistencia en disco mediante **IndexedDB** (`persistentLocalCache`), sobrevive al cierre total del navegador. |
| **Base de datos remota** | Cloud Firestore (colección compartida `expenses`). | Cloud Firestore (colección compartida `expenses`). |
| **Variables de entorno** | Prefijo `EXPO_PUBLIC_FIREBASE_*` vía Expo CLI. | Prefijo `VITE_FIREBASE_*` vía Vite. |
| **Distribución y ejecución** | Cliente móvil nativo ejecutado en Android/iOS mediante Expo Go o build APK. | Aplicación web instalable (Service Worker + `manifest.json`) accesible desde cualquier navegador. |

---

## 6. Aportes Individuales del Equipo (Sprint 3)

* **Thiago Engel (`@TogeS7`):** Configuración del proyecto Firebase y reglas de Firestore, implementación del servicio `src/services/firebase.js`, integración de `onSnapshot` y operaciones CRUD asíncronas en `ExpensesContext.js`, y validación de sincronización cruzada móvil-web.
* **Juan Cruz Sosa:** Implementación de persistencia local con `AsyncStorage`, diseño del patrón de hidratación con la bandera `isLoaded`, manejo de estados de carga/error en vistas (`ExpensesScreen`, `ExpenseDetailScreen`) y documentación de evidencias offline en la versión web.
