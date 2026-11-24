import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import useGlucose from '../hooks/useGlucose';
import { formatBrazilDate, todayBrazil, toISODate } from '../utils/date';

const YELLOW = '#F9A825';
const contexts = ['Jejum', 'Pré-refeição', 'Após refeição', 'Ao dormir', 'Outro'];

function today() { return todayBrazil(); }
function now() { const d = new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
const initial = () => ({ value: '', context: 'Jejum', date: today(), time: now(), note: '' });

function statusFor(value, context) {
  if (value < 70) return { label: 'Baixa', color: '#1976D2', icon: 'arrow-down-circle' };
  if ((context === 'Jejum' && value > 99) || (context !== 'Jejum' && value > 140)) return { label: 'Elevada', color: '#E53935', icon: 'arrow-up-circle' };
  return { label: 'Na faixa', color: '#43A047', icon: 'checkmark-circle' };
}

export default function GlicemiaScreen({ navigation }) {
  const { readings, ready, error, add, update, remove } = useGlucose();
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const average = useMemo(() => readings.length ? readings.reduce((sum, r) => sum + Number(r.value), 0) / readings.length : null, [readings]);
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const beginNew = () => { setForm(initial()); setEditingId(null); setFormError(''); setShowForm(true); };
  const beginEdit = (reading) => { setForm({ value: String(reading.value), context: reading.context, date: formatBrazilDate(reading.date), time: reading.time, note: reading.note || '' }); setEditingId(reading.id); setFormError(''); setShowForm(true); };

  const save = async () => {
    const value = Number(String(form.value).replace(',', '.'));
    if (!Number.isFinite(value) || value < 20 || value > 800) { setFormError('Informe uma glicemia entre 20 e 800 mg/dL.'); return; }
    const isoDate = toISODate(form.date) || (/^\d{4}-\d{2}-\d{2}$/.test(form.date) ? form.date : '');
    if (!isoDate || !/^\d{2}:\d{2}$/.test(form.time)) { setFormError('Informe data no formato DD/MM/AAAA e horário válidos.'); return; }
    setSaving(true); setFormError('');
    const payload = { ...form, date: isoDate, value };
    const saved = editingId ? await update(editingId, payload) : await add(payload);
    setSaving(false);
    if (saved) { setForm(initial()); setEditingId(null); setShowForm(false); } else setFormError('Não foi possível salvar. Tente novamente.');
  };

  const removeReading = (reading) => {
    const confirm = () => remove(reading.id);
    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      if (globalThis.confirm(`Excluir a medida de ${reading.value} mg/dL?`)) confirm();
    } else Alert.alert('Excluir medida?', 'Esta ação não pode ser desfeita.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: confirm }]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#9A6700" />
      <Header title="Glicemia" subtitle="Registre e acompanhe suas medidas" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Ionicons name="cube-outline" size={30} color="#FFF" /></View>
          <View style={styles.heroText}><Text style={styles.heroLabel}>MÉDIA DAS MEDIDAS</Text><Text style={styles.heroValue}>{average ? `${average.toFixed(0)} mg/dL` : '— mg/dL'}</Text></View>
          <View style={styles.countBadge}><Text style={styles.countText}>{readings.length}</Text><Text style={styles.countLabel}>medidas</Text></View>
        </View>

        <Pressable onPress={beginNew} style={styles.addButton}><Ionicons name="add-circle-outline" size={22} color="#FFF" /><Text style={styles.addText}>Registrar glicemia</Text></Pressable>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editingId ? 'Editar medida' : 'Nova medida'}</Text>
            <Text style={styles.label}>Valor em mg/dL</Text>
            <TextInput style={styles.valueInput} value={form.value} onChangeText={(value) => setField('value', value)} keyboardType="decimal-pad" placeholder="Ex.: 95" placeholderTextColor="#A3AAB3" />
            <Text style={styles.label}>Momento da medida</Text>
            <View style={styles.chips}>{contexts.map((context) => <Pressable key={context} onPress={() => setField('context', context)} style={[styles.chip, form.context === context && styles.chipSelected]}><Text style={[styles.chipText, form.context === context && styles.chipTextSelected]}>{context}</Text></Pressable>)}</View>
            <View style={styles.row}>
              <View style={styles.field}><Text style={styles.label}>Data</Text><TextInput style={styles.input} value={form.date} onChangeText={(value) => setField('date', value)} placeholder="DD/MM/AAAA" /></View>
              <View style={styles.field}><Text style={styles.label}>Horário</Text><TextInput style={styles.input} value={form.time} onChangeText={(value) => setField('time', value)} placeholder="HH:MM" /></View>
            </View>
            <Text style={styles.label}>Observação</Text>
            <TextInput style={[styles.input, styles.note]} value={form.note} onChangeText={(value) => setField('note', value)} placeholder="Opcional" multiline />
            {!!formError && <Text style={styles.error}>{formError}</Text>}
            <Pressable onPress={save} disabled={saving} style={styles.saveButton}><Ionicons name="save-outline" size={20} color="#FFF" /><Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar medida'}</Text></Pressable>
            <Pressable onPress={() => { setShowForm(false); setEditingId(null); }} style={styles.cancelButton}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
          </View>
        )}

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Histórico</Text><Text style={styles.sectionCount}>{readings.length} registros</Text></View>
        {!ready ? <ActivityIndicator style={{ margin: 25 }} color={YELLOW} /> : error ? <Text style={styles.error}>{error}</Text> : readings.length === 0 ? (
          <View style={styles.empty}><Ionicons name="water-outline" size={34} color="#AAB0BA" /><Text style={styles.emptyTitle}>Nenhuma medida registrada</Text><Text style={styles.emptyText}>Use o botão acima para começar seu controle.</Text></View>
        ) : readings.map((reading) => {
          const value = Number(reading.value); const status = statusFor(value, reading.context);
          return (
            <View key={reading.id} style={styles.readingCard}>
              <View style={[styles.statusIcon, { backgroundColor: `${status.color}18` }]}><Ionicons name={status.icon} size={24} color={status.color} /></View>
              <View style={styles.readingMain}><Text style={styles.readingValue}>{value} <Text style={styles.unit}>mg/dL</Text></Text><Text style={styles.readingContext}>{reading.context}</Text><Text style={styles.readingDate}>{formatBrazilDate(reading.date)} às {reading.time}</Text>{!!reading.note && <Text style={styles.readingNote}>{reading.note}</Text>}</View>
              <View style={styles.readingActions}><Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text><View style={styles.actionRow}><Pressable onPress={() => beginEdit(reading)} style={styles.iconButton}><Ionicons name="create-outline" size={19} color="#455A64" /></Pressable><Pressable onPress={() => removeReading(reading)} style={styles.iconButton}><Ionicons name="trash-outline" size={19} color="#E53935" /></Pressable></View></View>
            </View>
          );
        })}

        <View style={styles.infoCard}><Ionicons name="information-circle-outline" size={22} color="#7A6A45" /><Text style={styles.infoText}>Os valores desta tela são apenas organizacionais. Interpretar glicemia e ajustar medicamentos deve ser feito por um profissional de saúde.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  content: { padding: 16, paddingBottom: 36 },
  hero: { minHeight: 112, borderRadius: 22, backgroundColor: YELLOW, flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.22)' },
  heroText: { flex: 1, marginLeft: 12 },
  heroLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,.85)' },
  heroValue: { marginTop: 4, fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  countBadge: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  countText: { fontSize: 17, lineHeight: 19, fontWeight: '900', color: '#9A6700' },
  countLabel: { fontSize: 9, color: '#9A6700' },
  addButton: { height: 50, borderRadius: 14, backgroundColor: '#D98B00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 },
  addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  formCard: { borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EBEDF1', padding: 16, marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: '900', color: '#263238', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#69737D', marginBottom: 7, marginTop: 10 },
  valueInput: { height: 58, borderRadius: 12, borderWidth: 1, borderColor: '#E4E7EB', backgroundColor: '#FAFAFA', paddingHorizontal: 14, fontSize: 22, fontWeight: '800', color: '#263238' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { minHeight: 36, borderRadius: 18, borderWidth: 1, borderColor: '#E4E7EB', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, backgroundColor: '#FFFFFF' },
  chipSelected: { backgroundColor: '#FFF4DA', borderColor: YELLOW },
  chipText: { fontSize: 11.5, fontWeight: '700', color: '#69737D' },
  chipTextSelected: { color: '#9A6700' },
  row: { flexDirection: 'row', gap: 10 },
  field: { flex: 1 },
  input: { height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#E4E7EB', backgroundColor: '#FAFAFA', paddingHorizontal: 12, color: '#263238' },
  note: { height: 72, paddingTop: 12, textAlignVertical: 'top' },
  error: { marginTop: 10, color: '#C62828', fontSize: 12.5, fontWeight: '700' },
  saveButton: { height: 48, borderRadius: 12, backgroundColor: '#D98B00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14 },
  saveText: { color: '#FFFFFF', fontWeight: '800' },
  cancelButton: { height: 42, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#69737D', fontWeight: '700' },
  sectionHeader: { marginTop: 4, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#263238' },
  sectionCount: { fontSize: 11.5, fontWeight: '700', color: '#9AA1A9' },
  empty: { minHeight: 150, borderRadius: 18, borderWidth: 1, borderColor: '#EBEDF1', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { marginTop: 8, fontSize: 14, fontWeight: '800', color: '#455A64' },
  emptyText: { marginTop: 4, fontSize: 12, color: '#9AA1A9', textAlign: 'center' },
  readingCard: { minHeight: 112, borderRadius: 16, borderWidth: 1, borderColor: '#EBEDF1', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 },
  statusIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  readingMain: { flex: 1, marginHorizontal: 10 },
  readingValue: { fontSize: 20, fontWeight: '900', color: '#263238' },
  unit: { fontSize: 11, fontWeight: '700', color: '#69737D' },
  readingContext: { marginTop: 2, fontSize: 12, fontWeight: '700', color: '#69737D' },
  readingDate: { marginTop: 3, fontSize: 10.5, color: '#9AA1A9' },
  readingNote: { marginTop: 4, fontSize: 11, color: '#69737D' },
  readingActions: { alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch' },
  statusText: { fontSize: 10.5, fontWeight: '900' },
  actionRow: { flexDirection: 'row', gap: 4 },
  iconButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F4F5F7', alignItems: 'center', justifyContent: 'center' },
  infoCard: { marginTop: 12, borderRadius: 14, backgroundColor: '#F3EFE4', flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12 },
  infoText: { flex: 1, fontSize: 11.5, lineHeight: 17, color: '#7A6A45' },
});
