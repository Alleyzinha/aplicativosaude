import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LabeledInput from './LabeledInput';
import { colors } from '../constants/theme';

const frequencies = ['Uma vez ao dia', 'Duas vezes ao dia', 'Três vezes ao dia', 'Quando necessário'];
const routes = ['Oral', 'Gota', 'Injetável', 'Tópico', 'Outro'];

export default function MedicineForm({ values, error, onChange, onSubmit }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Informações do remédio</Text>

      <LabeledInput
        label="Nome do medicamento"
        placeholder="Ex: Dipirona"
        value={values.name}
        onChangeText={(value) => onChange('name', value)}
      />

      <View style={styles.row}>
        <View style={styles.field}>
          <LabeledInput
            label="Dosagem"
            placeholder="Ex: 500 mg"
            keyboardType="default"
            value={values.dosage}
            onChangeText={(value) => onChange('dosage', value)}
          />
        </View>
        <View style={styles.field}>
          <LabeledInput
            label="Horário"
            placeholder="Ex: 08:00"
            keyboardType="numbers-and-punctuation"
            value={values.time}
            onChangeText={(value) => onChange('time', value)}
          />
        </View>
      </View>

      <Text style={styles.sectionLabel}>Via de administração</Text>
      <View style={styles.chipsWrap}>
        {routes.map((route) => (
          <OptionChip
            key={route}
            label={route}
            selected={values.route === route}
            onPress={() => onChange('route', route)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Frequência</Text>
      <View style={styles.chipsWrap}>
        {frequencies.map((frequency) => (
          <OptionChip
            key={frequency}
            label={frequency}
            selected={values.frequency === frequency}
            onPress={() => onChange('frequency', frequency)}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Instruções adicionais</Text>
      <TextInput
        style={styles.instructions}
        placeholder="Ex: tomar após o café da manhã"
        placeholderTextColor={colors.textPlaceholder}
        value={values.instructions}
        onChangeText={(value) => onChange('instructions', value)}
        multiline
        textAlignVertical="top"
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable onPress={onSubmit} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Ionicons name="add-circle-outline" size={20} color={colors.white} />
        <Text style={styles.buttonText}>Adicionar medicamento</Text>
      </Pressable>
    </View>
  );
}

function OptionChip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selectedChip, pressed && styles.pressed]}
    >
      {selected && <Ionicons name="checkmark-circle" size={15} color={colors.white} />}
      <Text style={[styles.chipText, selected && styles.selectedChipText]}>{label}</Text>
    </Pressable>
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
  sectionLabel: { marginTop: 16, marginBottom: 8, fontSize: 12, fontWeight: '700', color: colors.textMuted },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 18, borderWidth: 1, borderColor: '#D8B4E2', backgroundColor: '#FCF7FD',
    paddingHorizontal: 11, paddingVertical: 7,
  },
  selectedChip: { backgroundColor: colors.medicine, borderColor: colors.medicine },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.medicine },
  selectedChipText: { color: colors.white },
  instructions: {
    minHeight: 82, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.inputBorder,
    backgroundColor: colors.background, color: colors.textDark, fontSize: 14,
  },
  error: { marginTop: 10, color: colors.error, fontSize: 12.5, fontWeight: '600' },
  button: {
    minHeight: 48, marginTop: 18, borderRadius: 12, flexDirection: 'row', gap: 8,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.medicine,
  },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.75 },
});
