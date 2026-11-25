import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_KEY = '@expensetracker/expenses';
const SETTINGS_KEY = '@expensetracker/settings';

const DEFAULT_SETTINGS = {
  notifications: true,
  darkMode: false,
};

const ExpensesContext = createContext(null);

export function ExpensesProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Hidratación inicial desde AsyncStorage
  useEffect(() => {
    const hydrateStorage = async () => {
      try {
        const [storedExpenses, storedSettings] = await Promise.all([
          AsyncStorage.getItem(EXPENSES_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
        ]);

        if (storedExpenses) {
          const parsedExpenses = JSON.parse(storedExpenses);
          if (Array.isArray(parsedExpenses)) {
            setExpenses(parsedExpenses);
          }
        }

        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings({
            notifications: Boolean(parsedSettings?.notifications),
            darkMode: Boolean(parsedSettings?.darkMode),
          });
        }
      } catch (error) {
        console.error('Error al hidratar AsyncStorage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    hydrateStorage();
  }, []);

  // 2. Persistir gastos solo cuando isLoaded es true
  useEffect(() => {
    if (!isLoaded) return;

    const saveExpenses = async () => {
      try {
        await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
      } catch (error) {
        console.error('Error al guardar gastos:', error);
      }
    };

    saveExpenses();
  }, [expenses, isLoaded]);

  // 3. Persistir ajustes solo cuando isLoaded es true
  useEffect(() => {
    if (!isLoaded) return;

    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Error al guardar ajustes:', error);
      }
    };

    saveSettings();
  }, [settings, isLoaded]);

  const addExpense = ({ title, amount, category, notes = '' }) => {
    const cleanTitle = String(title ?? '').trim();
    const numericAmount = Number(amount);

    if (!cleanTitle) {
      return { ok: false, error: 'El nombre del gasto es obligatorio.' };
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return { ok: false, error: 'El monto debe ser un número mayor a 0.' };
    }

    const newExpense = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: cleanTitle,
      amount: numericAmount,
      category: category || 'Otros',
      notes: String(notes ?? '').trim(),
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    return { ok: true, expense: newExpense };
  };

  const removeExpense = (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
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