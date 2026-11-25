import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';

const SETTINGS_KEY = '@expensetracker/settings';

const DEFAULT_SETTINGS = {
  notifications: true,
  darkMode: false,
};

const ExpensesContext = createContext(null);

function normalizeCreatedAt(rawCreatedAt) {
  if (!rawCreatedAt) return new Date().toISOString();
  if (typeof rawCreatedAt.toDate === 'function') {
    return rawCreatedAt.toDate().toISOString();
  }
  return String(rawCreatedAt);
}

export function ExpensesProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Hidratar ajustes locales desde AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings({
            notifications: Boolean(parsedSettings?.notifications),
            darkMode: Boolean(parsedSettings?.darkMode),
          });
        }
      } catch (error) {
        console.error('Error al cargar ajustes de AsyncStorage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // 2. Persistir cambios de ajustes en AsyncStorage
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch((error) =>
      console.error('Error al guardar ajustes:', error)
    );
  }, [settings, isLoaded]);

  // 3. Suscripción en tiempo real a la colección "expenses" en Cloud Firestore
  useEffect(() => {
    const expensesRef = collection(db, 'expenses');

    const unsubscribe = onSnapshot(
      expensesRef,
      (snapshot) => {
        const items = snapshot.docs.map((document) => {
          const data = document.data({ serverTimestamps: 'estimate' });
          return {
            id: document.id,
            title: data.title ?? '',
            amount: Number(data.amount ?? 0),
            category: data.category ?? 'Otros',
            notes: data.notes ?? '',
            createdAt: normalizeCreatedAt(data.createdAt),
          };
        });

        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setExpenses(items);
      },
      (error) => {
        console.error('Error en suscripción de Firestore:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const addExpense = ({ title, amount, category, notes = '' }) => {
    const cleanTitle = String(title ?? '').trim();
    const numericAmount = Number(amount);

    if (!cleanTitle) {
      return { ok: false, error: 'El nombre del gasto es obligatorio.' };
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return { ok: false, error: 'El monto debe ser un número mayor a 0.' };
    }

    addDoc(collection(db, 'expenses'), {
      title: cleanTitle,
      amount: numericAmount,
      category: category || 'Otros',
      notes: String(notes ?? '').trim(),
      createdAt: serverTimestamp(),
    }).catch((error) => {
      console.error('Error al guardar gasto en Firestore:', error);
    });

    return { ok: true };
  };

  const removeExpense = (id) => {
    deleteDoc(doc(db, 'expenses', id)).catch((error) => {
      console.error('Error al eliminar gasto en Firestore:', error);
    });
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: Boolean(value),
    }));
  };

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        isLoaded,
        addExpense,
        removeExpense,
        settings,
        updateSetting,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) {
    throw new Error('useExpenses debe usarse dentro de un ExpensesProvider');
  }
  return ctx;
}