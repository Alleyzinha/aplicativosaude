import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { styles } from './pressaoStyles';

export default function PressureForm({ form, setField, editing, error, saving, onCancel, onSave }) {
  const field = (label, key, placeholder, keyboardType = 'default', optional = false) => (
    <View style={styles.field} key={key}>
      <Text style={styles.label}>{label}{optional ? ' (opcional)' : ''}</Text>
      <TextInput value={form[key]} onChangeText={(value) => setField(key, value)} placeholder={placeholder} keyboardType={keyboardType} style={styles.input} placeholderTextColor="#8A8F98" />
    </View>
  );
  return <View style={styles.card}>
    <Text style={styles.cardTitle}>{editing ? 'Editar medida' : 'Nova medida'}</Text>
    <View style={styles.row}>{field('Sistólica (mmHg)', 'systolic', 'Ex.: 120', 'numeric')}{field('Diastólica (mmHg)', 'diastolic', 'Ex.: 80', 'numeric')}</View>
    <View style={styles.row}>{field('Pulso (bpm)', 'pulse', 'Opcional', 'numeric', true)}{field('Data (AAAA-MM-DD)', 'date', '2026-10-20')}</View>
    <View style={styles.row}>{field('Horário (HH:MM)', 'time', '08:30')}<View style={styles.field}><Text style={styles.label}>Bração (opcional)</Text><View style={styles.chips}>{['Esquerdo', 'Direito'].map((arm) => <Pressable key={arm} onPress={() => setField('arm', form.arm === arm ? '' : arm)} style={[styles.chip, form.arm === arm && styles.chipSelected]}><Text style={[styles.chipText, form.arm === arm && styles.chipTextSelected]}>{arm}</Text></Pressable>)}</View></View></View>
    {field('Observação', 'note', 'Ex.: antes do café', 'default', true)}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <View style={styles.row}><Pressable style={styles.secondaryButton} onPress={onCancel}><Text style={styles.secondaryText}>Cancelar</Text></Pressable><Pressable style={styles.saveButton} onPress={onSave} disabled={saving}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Salvar</Text>}</Pressable></View>
  </View>;
}

