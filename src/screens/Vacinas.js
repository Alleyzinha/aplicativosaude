import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import useVaccines from '../hooks/useVaccines';
import { formatBrazilDate, isValidBrazilDate, todayBrazil, toISODate } from '../utils/date';

const BLUE = '#1E88E5';
const vaccineSuggestions = ['COVID-19', 'Influenza', 'Hepatite B', 'Febre amarela', 'Tétano', 'DTP', 'HPV', 'Dupla viral', 'Pneumocócica', 'Outra'];

function todayISO() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function formatDate(value) { return formatBrazilDate(value); }
function validDate(value) {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return isValidBrazilDate(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return isValidBrazilDate(formatBrazilDate(value));
  return false;
}
function nextDoseStatus(nextDate) {
  if (!validDate(nextDate)) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(nextDate) ? nextDate : toISODate(nextDate);
  const today = new Date(); today.setHours(0,0,0,0);
  const next = new Date(`${iso}T00:00:00`);
  const days = Math.ceil((next - today) / 86400000);
  if (days < 0) return { label: 'Dose em atraso', color: '#D32F2F', background: '#FDECEC' };
  if (days <= 30) return { label: days === 0 ? 'Dose hoje' : `Em ${days} dias`, color: '#F57C00', background: '#FFF3E0' };
  return { label: `Prevista em ${formatDate(nextDate)}`, color: '#1976D2', background: '#E3F2FD' };
}

const EMPTY_FORM = { name: '', date: todayBrazil(), dose: '1ª dose', lot: '', place: '', professional: '', nextDate: '', note: '' };

export default function VacinasScreen({ navigation }) {
  const { vaccines, ready, error, add, remove } = useVaccines();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [filter, setFilter] = useState('Todas');

  const setField = (field, value) => { setForm((current) => ({ ...current, [field]: value })); if (formError) setFormError(''); };
  const upcoming = useMemo(() => vaccines.filter((item) => validDate(item.nextDate)), [vaccines]);
  const filtered = useMemo(() => {
    if (filter === 'Todas') return vaccines;
    if (filter === 'Com próxima dose') return upcoming;
    return vaccines.filter((item) => item.name === filter);
  }, [vaccines, upcoming, filter]);

  const save = async () => {
    if (!form.name.trim()) { setFormError('Informe o nome da vacina.'); return; }
    const applicationDate = toISODate(form.date) || (/^\d{4}-\d{2}-\d{2}$/.test(form.date) ? form.date : '');
    const nextDate = form.nextDate ? (toISODate(form.nextDate) || (/^\d{4}-\d{2}-\d{2}$/.test(form.nextDate) ? form.nextDate : '')) : '';
    if (!applicationDate) { setFormError('Informe uma data válida no formato DD/MM/AAAA.'); return; }
    if (form.nextDate && !nextDate) { setFormError('Informe uma próxima dose válida no formato DD/MM/AAAA.'); return; }
    setSaving(true); setFormError('');
    const saved = await add({ ...form, date: applicationDate, name: form.name.trim(), lot: form.lot.trim(), place: form.place.trim(), professional: form.professional.trim(), nextDate, note: form.note.trim() });
    setSaving(false);
    if (saved) { setForm(EMPTY_FORM); setShowForm(false); } else setFormError('Não foi possível salvar. Tente novamente.');
  };

  const confirmDelete = (item) => {
    const execute = () => remove(item.id);
    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      if (globalThis.confirm(`Excluir o registro de ${item.name}?`)) execute();
      return;
    }
    Alert.alert('Excluir vacina?', 'Esta ação não pode ser desfeita.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: execute }]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#145A9A" />
      <Header title="Vacinas" subtitle="Sua carteira de vacinação em um só lugar" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Ionicons name="shield-checkmark-outline" size={30} color="#FFFFFF" /></View>
          <View style={styles.heroText}><Text style={styles.heroLabel}>VACINAS REGISTRADAS</Text><Text style={styles.heroValue}>{vaccines.length}</Text></View>
          <View style={styles.heroBadge}><Ionicons name="calendar-outline" size={18} color={BLUE} /><Text style={styles.heroBadgeText}>{upcoming.length} próximas</Text></View>
        </View>

        <Pressable onPress={() => setShowForm((current) => !current)} style={styles.addButton}>
          <Ionicons name={showForm ? 'close-circle-outline' : 'add-circle-outline'} size={22} color="#FFFFFF" />
          <Text style={styles.addText}>{showForm ? 'Fechar formulário' : 'Registrar vacina'}</Text>
        </Pressable>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nova aplicação</Text>
            <Text style={styles.label}>Vacina *</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={(value) => setField('name', value)} placeholder="Ex.: Hepatite B" placeholderTextColor="#A3AAB3" />
            <View style={styles.quickVaccines}>{vaccineSuggestions.map((name) => (
              <Pressable key={name} onPress={() => setField('name', name)} style={[styles.quickChip, form.name === name && styles.quickChipSelected]}>
                <Text style={[styles.quickChipText, form.name === name && styles.quickChipTextSelected]}>{name}</Text>
              </Pressable>
            ))}</View>

            <View style={styles.row}>
              <View style={styles.field}><Text style={styles.label}>Data da aplicação *</Text><TextInput style={styles.input} value={form.date} onChangeText={(value) => setField('date', value)} placeholder="DD/MM/AAAA" placeholderTextColor="#A3AAB3" /></View>
              <View style={styles.field}><Text style={styles.label}>Dose</Text><TextInput style={styles.input} value={form.dose} onChangeText={(value) => setField('dose', value)} placeholder="Ex.: 1ª dose" placeholderTextColor="#A3AAB3" /></View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}><Text style={styles.label}>Lote</Text><TextInput style={styles.input} value={form.lot} onChangeText={(value) => setField('lot', value)} placeholder="Opcional" placeholderTextColor="#A3AAB3" /></View>
              <View style={styles.field}><Text style={styles.label}>Próxima dose</Text><TextInput style={styles.input} value={form.nextDate} onChangeText={(value) => setField('nextDate', value)} placeholder="DD/MM/AAAA" placeholderTextColor="#A3AAB3" /></View>
            </View>

            <Text style={styles.label}>Local de aplicação</Text>
            <TextInput style={styles.input} value={form.place} onChangeText={(value) => setField('place', value)} placeholder="Ex.: UBS Central" placeholderTextColor="#A3AAB3" />
            <Text style={styles.label}>Profissional ou aplicação</Text>
            <TextInput style={styles.input} value={form.professional} onChangeText={(value) => setField('professional', value)} placeholder="Opcional" placeholderTextColor="#A3AAB3" />
            <Text style={styles.label}>Observação</Text>
            <TextInput style={[styles.input, styles.multiline]} value={form.note} onChangeText={(value) => setField('note', value)} placeholder="Reações, recomendações ou outras informações" placeholderTextColor="#A3AAB3" multiline />

            {!!formError && <Text style={styles.error}>{formError}</Text>}
            {!!error && <Text style={styles.error}>{error}</Text>}
            <Pressable onPress={save} disabled={saving} style={styles.saveButton}><Ionicons name="save-outline" size={20} color="#FFFFFF" /><Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar vacina'}</Text></Pressable>
          </View>
        )}

        {vaccines.length > 0 && (
          <View style={styles.filters}>
            {['Todas', 'Com próxima dose', ...Array.from(new Set(vaccines.map((item) => item.name)))].map((option) => (
              <Pressable key={option} onPress={() => setFilter(option)} style={[styles.filterChip, filter === option && styles.filterChipSelected]}>
                <Text style={[styles.filterText, filter === option && styles.filterTextSelected]} numberOfLines={1}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Minha carteira</Text><Text style={styles.count}>{filtered.length} registros</Text></View>
        {!ready ? <Text style={styles.loading}>Carregando carteira...</Text> : filtered.length === 0 ? (
          <View style={styles.empty}><Ionicons name="shield-outline" size={34} color="#A7ADB6" /><Text style={styles.emptyTitle}>Nenhuma vacina registrada</Text><Text style={styles.emptyText}>Use “Registrar vacina” para guardar o histórico.</Text></View>
        ) : filtered.map((item) => {
          const status = nextDoseStatus(item.nextDate);
          return (
            <View key={item.id} style={styles.vaccineCard}>
              <View style={styles.vaccineHeader}>
                <View style={styles.vaccineIcon}><Ionicons name="fitness-outline" size={23} color={BLUE} /></View>
                <View style={styles.vaccineMain}><Text style={styles.vaccineName}>{item.name}</Text><Text style={styles.vaccineDose}>{item.dose}</Text></View>
                <Pressable onPress={() => confirmDelete(item)} style={styles.deleteButton}><Ionicons name="trash-outline" size={18} color="#D32F2F" /></Pressable>
              </View>
              <Text style={styles.appliedDate}>Aplicada em {formatDate(item.date)}</Text>
              {status && <View style={[styles.statusBadge, { backgroundColor: status.background }]}><Ionicons name="calendar-outline" size={14} color={status.color} /><Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text></View>}
              <View style={styles.detailsGrid}>
                {item.lot ? <View style={styles.detail}><Text style={styles.detailLabel}>Lote</Text><Text style={styles.detailText}>{item.lot}</Text></View> : null}
                {item.place ? <View style={styles.detail}><Text style={styles.detailLabel}>Local</Text><Text style={styles.detailText}>{item.place}</Text></View> : null}
                {item.professional ? <View style={styles.detail}><Text style={styles.detailLabel}>Profissional</Text><Text style={styles.detailText}>{item.professional}</Text></View> : null}
              </View>
              {item.note ? <View style={styles.noteBox}><Ionicons name="document-text-outline" size={17} color="#69737D" /><Text style={styles.noteText}>{item.note}</Text></View> : null}
            </View>
          );
        })}

        <View style={styles.infoCard}><Ionicons name="information-circle-outline" size={20} color="#607D8B" /><Text style={styles.infoText}>Mantenha a carteira física ou digital atualizada. Consulte um profissional de saúde para confirmar o calendário indicado para sua idade e situação.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F8FB' },
  content: { padding: 16, paddingBottom: 36 },
  hero: { minHeight: 112, borderRadius: 20, backgroundColor: BLUE, flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.18)', alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1, marginLeft: 12 },
  heroLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,.88)' },
  heroValue: { marginTop: 2, fontSize: 30, lineHeight: 34, fontWeight: '900', color: '#FFFFFF' },
  heroBadge: { minHeight: 54, minWidth: 72, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  heroBadgeText: { marginTop: 2, fontSize: 9.5, fontWeight: '800', color: '#145A9A' },
  addButton: { height: 50, borderRadius: 13, backgroundColor: '#1976C9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  formCard: { marginTop: 12, borderRadius: 18, borderWidth: 1, borderColor: '#E7EBF1', backgroundColor: '#FFFFFF', padding: 16 },
  formTitle: { fontSize: 16, fontWeight: '900', color: '#263238', marginBottom: 4 },
  label: { marginTop: 12, marginBottom: 7, fontSize: 12, fontWeight: '700', color: '#69737D' },
  input: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#DFE5EC', backgroundColor: '#FAFBFC', paddingHorizontal: 12, paddingVertical: 10, color: '#263238' },
  multiline: { minHeight: 74, textAlignVertical: 'top' },
  quickVaccines: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  quickChip: { minHeight: 34, borderRadius: 17, borderWidth: 1, borderColor: '#DFE5EC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9 },
  quickChipSelected: { borderColor: BLUE, backgroundColor: '#EAF4FD' },
  quickChipText: { fontSize: 10.5, fontWeight: '700', color: '#69737D' },
  quickChipTextSelected: { color: '#145A9A' },
  row: { flexDirection: 'row', gap: 10 },
  field: { flex: 1 },
  error: { marginTop: 10, color: '#C62828', fontSize: 12.5, fontWeight: '700' },
  saveButton: { height: 48, marginTop: 14, borderRadius: 12, backgroundColor: '#1976C9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  saveText: { color: '#FFFFFF', fontWeight: '800' },
  filters: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  filterChip: { maxWidth: 160, minHeight: 34, borderRadius: 17, borderWidth: 1, borderColor: '#DFE5EC', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9 },
  filterChipSelected: { borderColor: BLUE, backgroundColor: '#EAF4FD' },
  filterText: { fontSize: 10.5, fontWeight: '700', color: '#69737D' },
  filterTextSelected: { color: '#145A9A' },
  sectionHeader: { marginTop: 18, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#263238' },
  count: { fontSize: 11.5, fontWeight: '700', color: '#9AA1A9' },
  loading: { padding: 20, textAlign: 'center', color: '#69737D' },
  empty: { minHeight: 150, borderRadius: 16, borderWidth: 1, borderColor: '#E7EBF1', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { marginTop: 8, fontSize: 14, fontWeight: '800', color: '#455A64' },
  emptyText: { marginTop: 4, fontSize: 12, color: '#9AA1A9', textAlign: 'center' },
  vaccineCard: { borderRadius: 16, borderWidth: 1, borderColor: '#E7EBF1', backgroundColor: '#FFFFFF', padding: 12, marginBottom: 9 },
  vaccineHeader: { flexDirection: 'row', alignItems: 'center' },
  vaccineIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#EAF4FD', alignItems: 'center', justifyContent: 'center' },
  vaccineMain: { flex: 1, marginHorizontal: 9 },
  vaccineName: { fontSize: 14, fontWeight: '900', color: '#263238' },
  vaccineDose: { marginTop: 2, fontSize: 11.5, color: '#69737D' },
  deleteButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center' },
  appliedDate: { marginTop: 10, fontSize: 12, fontWeight: '700', color: '#455A64' },
  statusBadge: { marginTop: 7, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 10.5, fontWeight: '900' },
  detailsGrid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  detail: { minWidth: 92, flexGrow: 1, borderRadius: 10, backgroundColor: '#F6F8FB', padding: 8 },
  detailLabel: { fontSize: 9.5, fontWeight: '800', color: '#9AA1A9' },
  detailText: { marginTop: 2, fontSize: 11.5, color: '#455A64' },
  noteBox: { marginTop: 8, borderRadius: 10, backgroundColor: '#F5F7F9', flexDirection: 'row', alignItems: 'flex-start', gap: 7, padding: 9 },
  noteText: { flex: 1, fontSize: 11.5, lineHeight: 16, color: '#69737D' },
  infoCard: { marginTop: 12, borderRadius: 14, backgroundColor: '#EEF4F7', flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12 },
  infoText: { flex: 1, fontSize: 11.5, lineHeight: 17, color: '#607D8B' },
});
