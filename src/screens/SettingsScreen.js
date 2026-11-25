import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useExpenses } from '../context/ExpensesContext';

export default function SettingsScreen() {
  const { settings, updateSetting } = useExpenses();

  return (
    <View style={[styles.container, settings.darkMode && styles.darkContainer]}>
      <Text style={[styles.title, settings.darkMode && styles.darkText]}>Ajustes</Text>

      <View style={[styles.card, settings.darkMode && styles.darkCard]}>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>
            Notificaciones
          </Text>
          <Switch
            value={settings.notifications}
            onValueChange={(val) => updateSetting('notifications', val)}
          />
        </View>

        <View style={[styles.settingRow, styles.borderTop]}>
          <Text style={[styles.settingLabel, settings.darkMode && styles.darkText]}>
            Modo oscuro
          </Text>
          <Switch
            value={settings.darkMode}
            onValueChange={(val) => updateSetting('darkMode', val)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#F8FAFC' },
  darkContainer: { backgroundColor: '#0F172A' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 20 },
  darkText: { color: '#F8FAFC' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  darkCard: { backgroundColor: '#1E293B' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  borderTop: { borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  settingLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
});