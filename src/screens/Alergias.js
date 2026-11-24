import React, { useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import useAllergies from '../hooks/useAllergies';
import { formatBrazilDate } from '../utils/date';

const ORANGE = '#FB8C00';
const types = ['Medicamento', 'Alimento', 'Animal', 'Ambiente', 'Inseto', 'Outra'];
const severity = [
  { label: 'Leve', color: '#43A047', icon: 'checkmark-circle' },
  { label: 'Moderada', color: '#F57C00', icon: 'alert-circle' },
  { label: 'Grave', color: '#D32F2F', icon: 'warning' },
];

function SeverityBadge({ label }) {
  const item = severity.find((option) => option.label === label) || severity[0];
  return (
    <View style={[styles.badge, { backgroundColor: `${item.color}18` }]}> 
      <Ionicons name={item.icon} size={14} color={item.color} />
      <Text style={[styles.badgeText, { color: item.color }]}>{label}</Text>
    </View>
  );
}

export default function AlergiasScreen({ navigation }) {
  const { form, setField, allergies, ready, error, add, remove } = useAllergies();
  const [showForm, setShowForm] = useState(false);

  const save = async () => {
    if (await add()) setShowForm(false);
  };

  const confirmDelete = (item) => {
    const execute = () => remove(item.id);
    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      if (globalThis.confirm(`Excluir ${item.name}?`)) execute();
      return;
    }
    Alert.alert('Excluir alergia?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: execute },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#A85D00" />
      <Header title="Alergias" subtitle="Organize substâncias, sintomas e plano de cuidados" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Ionicons name="bug-outline" size={30} color="#FFFFFF" /></View>
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>ALERGIAS CADASTRADAS</Text>
            <Text style={styles.heroValue}>{allergies.length}</Text>
          </View>
          <View style={styles.heroCount}>
            <Ionicons name="warning-outline" size={20} color={ORANGE} />
            <Text style={styles.heroCountText}>{allergies.filter((item) => item.severity === 'Grave').length} graves</Text>
          </View>
        </View>

        <Pressable onPress={() => setShowForm((current) => !current)} style={styles.addButton}>
          <Ionicons name={showForm ? 'close-circle-outline' : 'add-circle-outline'} size={22} color="#FFFFFF" />
          <Text style={styles.addText}>{showForm ? 'Fechar formulário' : 'Adicionar alergia'}</Text>
        </Pressable>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nova alergia</Text>

            <Text style={styles.label}>Nome da substância ou alergia *</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={(value) => setField('name', value)} placeholder="Ex.: Amendoim, penicilina, poeira" placeholderTextColor="#A3AAB3" />

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.chipsWrap}>{types.map((type) => (
              <Pressable key={type} onPress={() => setField('type', type)} style={[styles.chip, form.type === type && styles.chipSelected]}>
                <Text style={[styles.chipText, form.type === type && styles.chipTextSelected]}>{type}</Text>
              </Pressable>
            ))}</View>

            <Text style={styles.label}>Gravidade</Text>
            <View style={styles.severityRow}>{severity.map((option) => (
              <Pressable key={option.label} onPress={() => setField('severity', option.label)} style={[styles.severityButton, form.severity === option.label && { borderColor: option.color, backgroundColor: `${option.color}12` }]}>
                <Ionicons name={option.icon} size={18} color={form.severity === option.label ? option.color : '#7A8088'} />
                <Text style={[styles.severityText, form.severity === option.label && { color: option.color }]}>{option.label}</Text>
              </Pressable>
            ))}</View>

            <Text style={styles.label}>Sintomas conhecidos *</Text>
            <TextInput style={[styles.input, styles.multiline]} value={form.symptoms} onChangeText={(value) => setField('symptoms', value)} placeholder="Ex.: coceira, inchaço, falta de ar" placeholderTextColor="#A3AAB3" multiline />

            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Diagnóstico em</Text>
                <TextInput style={styles.input} value={form.date} onChangeText={(value) => setField('date', value)} placeholder="DD/MM/AAAA" placeholderTextColor="#A3AAB3" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Diagnosticado por</Text>
                <TextInput style={styles.input} value={form.diagnosedBy} onChangeText={(value) => setField('diagnosedBy', value)} placeholder="Ex.: alergologista" placeholderTextColor="#A3AAB3" />
              </View>
            </View>

            <Text style={styles.label}>Plano para emergência</Text>
            <TextInput style={[styles.input, styles.multiline]} value={form.emergencyPlan} onChangeText={(value) => setField('emergencyPlan', value)} placeholder="Ex.: usar adrenalina prescrita e ligar para o SAMU" placeholderTextColor="#A3AAB3" multiline />

            {!!error && <Text style={styles.error}>{error}</Text>}
            <Pressable onPress={save} style={styles.saveButton}><Ionicons name="save-outline" size={20} color="#FFFFFF" /><Text style={styles.saveText}>Salvar alergia</Text></Pressable>
          </View>
        )}

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Minhas alergias</Text><Text style={styles.count}>{allergies.length} itens</Text></View>
        {!ready ? <Text style={styles.loading}>Carregando alergias...</Text> : allergies.length === 0 ? (
          <View style={styles.empty}><Ionicons name="shield-checkmark-outline" size={34} color="#A7ADB6" /><Text style={styles.emptyTitle}>Nenhuma alergia cadastrada</Text><Text style={styles.emptyText}>Adicione substâncias ou situações que exigem cuidado.</Text></View>
        ) : allergies.map((item) => (
          <View key={item.id} style={styles.allergyCard}>
            <View style={styles.allergyHeader}>
              <View style={styles.allergyIcon}><Ionicons name="bug-outline" size={22} color={ORANGE} /></View>
              <View style={styles.allergyMain}><Text style={styles.allergyName}>{item.name}</Text><Text style={styles.allergyType}>{item.type}</Text></View>
              <SeverityBadge label={item.severity} />
              <Pressable onPress={() => confirmDelete(item)} style={styles.deleteButton}><Ionicons name="trash-outline" size={18} color="#D32F2F" /></Pressable>
            </View>
            <View style={styles.divider} />
            <Text style={styles.detailLabel}>Sintomas</Text>
            <Text style={styles.detailText}>{item.symptoms}</Text>
            {(item.diagnosedBy || item.date) && <><Text style={styles.detailLabel}>Diagnóstico</Text><Text style={styles.detailText}>{[item.diagnosedBy, formatBrazilDate(item.date)].filter(Boolean).join(' · ')}</Text></>}
            {item.emergencyPlan && <View style={styles.planBox}><Ionicons name="medical-outline" size={18} color="#B42318" /><Text style={styles.planText}>{item.emergencyPlan}</Text></View>}
          </View>
        ))}

        <View style={styles.warningCard}><Ionicons name="information-circle-outline" size={20} color="#7A6A45" /><Text style={styles.warningText}>Em caso de dificuldade para respirar, inchaço na boca ou rosto, tontura intensa ou desmaio, procure ajuda imediatamente pelo SAMU 192.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  content: { padding: 16, paddingBottom: 36 },
  hero: { minHeight: 112, borderRadius: 20, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.18)', alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1, marginLeft: 12 },
  heroLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,.88)' },
  heroValue: { marginTop: 2, fontSize: 30, lineHeight: 34, fontWeight: '900', color: '#FFFFFF' },
  heroCount: { minHeight: 54, minWidth: 66, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  heroCountText: { marginTop: 2, fontSize: 9.5, fontWeight: '800', color: '#A85D00' },
  addButton: { height: 50, borderRadius: 13, backgroundColor: '#E87900', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  formCard: { marginTop: 12, borderRadius: 18, borderWidth: 1, borderColor: '#EBEDF1', backgroundColor: '#FFFFFF', padding: 16 },
  formTitle: { fontSize: 16, fontWeight: '900', color: '#263238', marginBottom: 4 },
  label: { marginTop: 12, marginBottom: 7, fontSize: 12, fontWeight: '700', color: '#69737D' },
  input: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#E4E7EB', backgroundColor: '#FAFAFA', paddingHorizontal: 12, paddingVertical: 10, color: '#263238' },
  multiline: { minHeight: 74, textAlignVertical: 'top' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { minHeight: 36, borderRadius: 18, borderWidth: 1, borderColor: '#E4E7EB', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  chipSelected: { borderColor: ORANGE, backgroundColor: '#FFF3E0' },
  chipText: { fontSize: 11.5, fontWeight: '700', color: '#69737D' },
  chipTextSelected: { color: '#A85D00' },
  severityRow: { flexDirection: 'row', gap: 7 },
  severityButton: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#E4E7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  severityText: { fontSize: 10.5, fontWeight: '800', color: '#69737D' },
  row: { flexDirection: 'row', gap: 10 },
  field: { flex: 1 },
  error: { marginTop: 10, color: '#C62828', fontSize: 12.5, fontWeight: '700' },
  saveButton: { height: 48, marginTop: 14, borderRadius: 12, backgroundColor: '#E87900', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  saveText: { color: '#FFFFFF', fontWeight: '800' },
  sectionHeader: { marginTop: 18, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#263238' },
  count: { fontSize: 11.5, fontWeight: '700', color: '#9AA1A9' },
  loading: { padding: 20, textAlign: 'center', color: '#69737D' },
  empty: { minHeight: 150, borderRadius: 16, borderWidth: 1, borderColor: '#EBEDF1', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { marginTop: 8, fontSize: 14, fontWeight: '800', color: '#455A64' },
  emptyText: { marginTop: 4, fontSize: 12, color: '#9AA1A9', textAlign: 'center' },
  allergyCard: { borderRadius: 16, borderWidth: 1, borderColor: '#EBEDF1', backgroundColor: '#FFFFFF', padding: 12, marginBottom: 9 },
  allergyHeader: { flexDirection: 'row', alignItems: 'center' },
  allergyIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' },
  allergyMain: { flex: 1, marginHorizontal: 9 },
  allergyName: { fontSize: 14, fontWeight: '900', color: '#263238' },
  allergyType: { marginTop: 2, fontSize: 11.5, color: '#69737D' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 5 },
  badgeText: { fontSize: 9.5, fontWeight: '900' },
  deleteButton: { width: 34, height: 34, marginLeft: 5, borderRadius: 10, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: '#EEF0F3', marginVertical: 10 },
  detailLabel: { fontSize: 10.5, fontWeight: '900', color: '#9AA1A9', marginTop: 4 },
  detailText: { marginTop: 2, fontSize: 12.5, lineHeight: 17, color: '#455A64' },
  planBox: { marginTop: 9, borderRadius: 10, backgroundColor: '#FFF1F0', flexDirection: 'row', alignItems: 'flex-start', gap: 7, padding: 9 },
  planText: { flex: 1, fontSize: 11.5, lineHeight: 16, color: '#B42318' },
  warningCard: { marginTop: 12, borderRadius: 14, backgroundColor: '#F3EFE4', flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12 },
  warningText: { flex: 1, fontSize: 11.5, lineHeight: 17, color: '#7A6A45' },
});
