import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LabeledInput from './LabeledInput';
import { colors } from '../constants/theme';

export default function MedicineForm({ values, error, onChange, onSubmit }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Informações do remédio</Text>
      <LabeledInput label="Nome" placeholder="Ex: Dipirona" value={values.name} onChangeText={(value) => onChange('name', value)} />

      <View style={styles.row}>
        <View style={styles.field}>
          <LabeledInput label="Dosagem" placeholder="Ex: 500 mg" value={values.dosage} onChangeText={(value) => onChange('dosage', value)} />
        </View>
        <View style={styles.field}>
          <LabeledInput label="Horário" placeholder="Ex: 08:00" value={values.time} onChangeText={(value) => onChange('time', value)} />
        </View>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable onPress={onSubmit} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Ionicons name="add-circle-outline" size={20} color={colors.white} />
        <Text style={styles.buttonText}>Adicionar remédio</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16, padding: 18, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  title: { marginBottom: 14, fontSize: 15, fontWeight: '800', color: colors.textDark },
  row: { flexDirection: 'row', gap: 12, marginTop: 14 },
  field: { flex: 1 },
  error: { marginTop: 10, color: colors.error, fontSize: 12.5, fontWeight: '600' },
  button: {
    minHeight: 48, marginTop: 18, borderRadius: 12, flexDirection: 'row', gap: 8,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.medicine,
  },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.75 },
});
