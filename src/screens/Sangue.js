import React, { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import TextButton from '../components/blood/TextButton';
import ActionButton from '../components/blood/ActionButton';
import Field from '../components/blood/Field';
import Bullet from '../components/blood/Bullet';
import InfoTile from '../components/blood/InfoTile';
import SectionCard from '../components/blood/SectionCard';
import { useProfile } from '../context/ProfileContext';
import useBloodExams from '../hooks/useBloodExams';
import { colors } from '../constants/theme';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RED = '#C62828';
const COMPATIBILITY = {
  'A+': { receives: ['A+', 'A-', 'O+', 'O-'], donates: ['A+', 'AB+'] },
  'A-': { receives: ['A-', 'O-'], donates: ['A+', 'A-', 'AB+', 'AB-'] },
  'B+': { receives: ['B+', 'B-', 'O+', 'O-'], donates: ['B+', 'AB+'] },
  'B-': { receives: ['B-', 'O-'], donates: ['B+', 'B-', 'AB+', 'AB-'] },
  'AB+': { receives: BLOOD_TYPES, donates: ['AB+'] },
  'AB-': { receives: ['AB-', 'A-', 'B-', 'O-'], donates: ['AB+', 'AB-'] },
  'O+': { receives: ['O+', 'O-'], donates: ['O+', 'A+', 'B+', 'AB+'] },
  'O-': { receives: ['O-'], donates: BLOOD_TYPES },
};
const DONATION_URL = 'https://www.gov.br/saude/pt-br/composicao/saes/doacao-de-sangue/doacao-de-sangue/';
const TRANSFUSION_URL = 'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2026/prt11685_03_07_2026.html';

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function validISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

function formatDate(value) {
  if (!validISODate(value)) return value;
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

function emptyExam() {
  return { name: '', date: todayISO(), result: '', unit: '', referenceRange: '', note: '' };
}

export default function SangueScreen({ navigation }) {
  const { profile, updateProfile } = useProfile();
  const { exams, ready, error: storageError, addExam, updateExam, deleteExam } = useBloodExams();
  const [editingBloodType, setEditingBloodType] = useState(false);
  const [bloodTypeDraft, setBloodTypeDraft] = useState('');
  const [form, setForm] = useState(emptyExam);
  const [editingExamId, setEditingExamId] = useState(null);
  const [formError, setFormError] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [linkError, setLinkError] = useState('');
  const bloodType = BLOOD_TYPES.includes(profile.bloodType) ? profile.bloodType : '';
  const selectedCompatibility = bloodType ? COMPATIBILITY[bloodType] : null;

  const startBloodTypeEdit = () => {
    setBloodTypeDraft(bloodType);
    setEditingBloodType(true);
  };

  const saveBloodType = () => {
    updateProfile({ bloodType: BLOOD_TYPES.includes(bloodTypeDraft) ? bloodTypeDraft : '' });
    setEditingBloodType(false);
  };

  const openLink = async (url) => {
    setLinkError('');
    try {
      await Linking.openURL(url);
    } catch {
      setLinkError('Não foi possível abrir o link. Verifique sua conexão e tente novamente.');
    }
  };

  const startExamEdit = (exam) => {
    setForm({ name: exam.name, date: exam.date || todayISO(), result: exam.result, unit: exam.unit, referenceRange: exam.referenceRange, note: exam.note });
    setEditingExamId(exam.id);
    setFormError('');
    setPendingDeleteId(null);
  };

  const cancelExamEdit = () => {
    setForm(emptyExam());
    setEditingExamId(null);
    setFormError('');
  };

  const saveExam = async () => {
    const exam = {
      ...form,
      name: form.name.trim(),
      result: form.result.trim(),
      date: form.date.trim(),
      unit: form.unit.trim(),
      referenceRange: form.referenceRange.trim(),
      note: form.note.trim(),
    };
    if (!exam.name || !exam.result) {
      setFormError('Preencha o nome do exame e o resultado.');
      return;
    }
    if (exam.date && !validISODate(exam.date)) {
      setFormError('Informe uma data válida no formato AAAA-MM-DD.');
      return;
    }
    setSaving(true);
    setFormError('');
    const saved = editingExamId ? await updateExam(editingExamId, exam) : await addExam(exam);
    setSaving(false);
    if (!saved) {
      setFormError('Não foi possível salvar. Seus dados continuam no formulário; tente novamente.');
      return;
    }
    cancelExamEdit();
  };

  const confirmDelete = async (id) => {
    setSaving(true);
    const deleted = await deleteExam(id);
    setSaving(false);
    if (!deleted) setFormError('Não foi possível excluir o exame. Tente novamente.');
    else setPendingDeleteId(null);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <Header title="Sangue" subtitle="Seu tipo, informações e exames em um só lugar" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.summary]}>
          <View style={styles.icon}><Ionicons name="water" size={36} color={RED} /></View>
          <Text style={styles.eyebrow}>MEU TIPO SANGUÍNEO</Text>
          <Text style={bloodType ? styles.bloodType : styles.emptyType}>{bloodType || 'Não informado'}</Text>
          <Text style={[styles.body, styles.center]}>
            {bloodType ? 'Esta informação também aparece no seu perfil.' : 'Registre o tipo indicado no seu exame para vê-lo aqui e no perfil.'}
          </Text>
          {!editingBloodType ? (
            <ActionButton styles={styles} icon="create-outline" label={bloodType ? 'Alterar tipo sanguíneo' : 'Informar tipo sanguíneo'} onPress={startBloodTypeEdit} />
          ) : (
            <View style={styles.bloodTypeEditor}>
              <Text style={styles.sectionTitle}>Selecione o tipo informado no seu exame</Text>
              <View style={styles.typePicker}>
                {BLOOD_TYPES.map((type) => (
                  <Pressable key={type} accessibilityRole="radio" accessibilityState={{ checked: bloodTypeDraft === type }} onPress={() => setBloodTypeDraft(type)} style={[styles.typeOption, bloodTypeDraft === type && styles.typeOptionSelected]}>
                    <Text style={[styles.typeOptionText, bloodTypeDraft === type && styles.typeOptionTextSelected]}>{type}</Text>
                  </Pressable>
                ))}
                <Pressable accessibilityRole="radio" accessibilityLabel="Não sei meu tipo sanguíneo" accessibilityState={{ checked: bloodTypeDraft === '' }} onPress={() => setBloodTypeDraft('')} style={[styles.typeOption, bloodTypeDraft === '' && styles.typeOptionSelected]}>
                  <Text style={[styles.typeOptionText, bloodTypeDraft === '' && styles.typeOptionTextSelected]}>Não sei</Text>
                </Pressable>
              </View>
              <ActionButton styles={styles} icon="checkmark" label="Salvar tipo" onPress={saveBloodType} />
              <TextButton styles={styles} label="Cancelar" onPress={() => setEditingBloodType(false)} />
            </View>
          )}
        </View>

        <SectionCard styles={styles} icon="git-branch-outline" title="Entenda ABO e Rh">
          <Text style={styles.body}>O sistema ABO agrupa o sangue em A, B, AB ou O. O fator Rh considera a presença do antígeno D nas hemácias: quando presente, o tipo é positivo; quando ausente, é negativo.</Text>
          <View style={styles.infoGrid}>
            <InfoTile styles={styles} icon="ellipse" title="ABO" body="A, B, AB ou O" />
            <InfoTile styles={styles} icon="add-circle" title="Fator Rh" body="Positivo (+) ou negativo (−)" />
          </View>
          <Text style={styles.smallNote}>Esses sistemas são importantes, mas não são os únicos fatores avaliados pelos serviços de hemoterapia.</Text>
        </SectionCard>

        <SectionCard styles={styles} icon="flask-outline" title="Componentes do sangue">
          <Text style={styles.body}>Uma doação pode ser separada em componentes usados em diferentes situações de cuidado.</Text>
          <InfoTile styles={styles} icon="water" title="Hemácias" body="Transportam oxigênio pelo organismo." />
          <InfoTile styles={styles} icon="shield-checkmark-outline" title="Plaquetas" body="Participam da coagulação do sangue." />
          <InfoTile styles={styles} icon="beaker-outline" title="Plasma" body="Parte líquida que contém água e proteínas." />
          <InfoTile styles={styles} icon="fitness-outline" title="Leucócitos" body="Células que participam da defesa do organismo." />
        </SectionCard>

        <SectionCard styles={styles} icon="people-outline" title="Compatibilidade de hemácias">
          <Text style={styles.body}>A tabela abaixo é uma referência educativa simplificada para hemácias, considerando ABO e Rh.</Text>
          {selectedCompatibility ? (
            <View style={styles.personalCompatibility}>
              <Text style={styles.personalTitle}>Para o seu tipo {bloodType}</Text>
              <Text style={styles.body}>Pode receber hemácias de: <Text style={styles.emphasis}>{selectedCompatibility.receives.join(', ')}</Text></Text>
              <Text style={styles.body}>Pode doar hemácias para: <Text style={styles.emphasis}>{selectedCompatibility.donates.join(', ')}</Text></Text>
            </View>
          ) : (
            <Pressable accessibilityRole="button" onPress={startBloodTypeEdit} style={styles.prompt}>
              <Ionicons name="information-circle-outline" size={21} color={colors.primary} />
              <Text style={styles.promptText}>Informe seu tipo sanguíneo para destacar a linha correspondente.</Text>
            </Pressable>
          )}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeading, styles.typeColumn]}>Tipo</Text>
            <Text style={[styles.tableHeading, styles.compatColumn]}>Recebe de</Text>
            <Text style={[styles.tableHeading, styles.compatColumn]}>Doa para</Text>
          </View>
          {BLOOD_TYPES.map((type) => (
            <View key={type} style={[styles.tableRow, type === bloodType && styles.tableRowSelected]}>
              <Text style={[styles.tableType, styles.typeColumn]}>{type}</Text>
              <Text style={[styles.tableValue, styles.compatColumn]}>{COMPATIBILITY[type].receives.join(', ')}</Text>
              <Text style={[styles.tableValue, styles.compatColumn]}>{COMPATIBILITY[type].donates.join(', ')}</Text>
            </View>
          ))}
          <View style={styles.caution}>
            <Ionicons name="warning-outline" size={21} color="#9A3412" />
            <Text style={styles.cautionText}>Esta tabela não determina se uma transfusão é segura. A equipe de saúde precisa avaliar exames e compatibilidade em cada situação.</Text>
          </View>
          <TextButton styles={styles} label="Ver regulamento técnico do Ministério da Saúde" onPress={() => openLink(TRANSFUSION_URL)} />
        </SectionCard>

        <SectionCard styles={styles} icon="heart-outline" title="Doação de sangue">
          <Text style={styles.body}>A doação é voluntária. Como orientação geral do Ministério da Saúde, os critérios incluem:</Text>
          <Bullet styles={styles} text="Idade de 16 a 69 anos; pessoas menores de 18 precisam de consentimento do responsável. A primeira doação deve ocorrer antes dos 60 anos para doar entre 60 e 69." />
          <Bullet styles={styles} text="Peso mínimo de 50 kg, documento oficial com foto e pelo menos 6 horas de sono nas últimas 24 horas." />
          <Bullet styles={styles} text="Não é preciso estar em jejum. Evite alimentos gordurosos nas 3 horas antes da doação." />
          <Text style={styles.smallNote}>A aptidão é definida pelo serviço de hemoterapia. Os critérios podem mudar; consulte a orientação oficial antes de doar.</Text>
          <ActionButton styles={styles} icon="open-outline" label="Consultar critérios oficiais para doação" onPress={() => openLink(DONATION_URL)} />
          {!!linkError && <Text accessibilityRole="alert" style={styles.errorText}>{linkError}</Text>}
        </SectionCard>

        <SectionCard styles={styles} icon="document-text-outline" title="Meus exames de sangue" subtitle="Registre os resultados como aparecem no seu laudo. O app não interpreta os valores.">
          {ready ? null : <ActivityIndicator accessibilityLabel="Carregando exames" color={RED} />}
          {!!storageError && <Text accessibilityRole="alert" style={styles.errorText}>{storageError}</Text>}
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>{editingExamId ? 'Editar exame' : 'Adicionar exame'}</Text>
            <Field styles={styles} label="Nome do exame *" value={form.name} onChangeText={(name) => setForm((current) => ({ ...current, name }))} placeholder="Ex.: Hemograma" maxLength={80} />
            <Field styles={styles} label="Data (AAAA-MM-DD)" value={form.date} onChangeText={(date) => setForm((current) => ({ ...current, date }))} placeholder="2026-10-20" maxLength={10} />
            <Field styles={styles} label="Resultado *" value={form.result} onChangeText={(result) => setForm((current) => ({ ...current, result }))} placeholder="Como aparece no laudo" maxLength={120} />
            <Field styles={styles} label="Unidade" value={form.unit} onChangeText={(unit) => setForm((current) => ({ ...current, unit }))} placeholder="Ex.: g/dL" maxLength={30} />
            <Field styles={styles} label="Referência informada no laudo" value={form.referenceRange} onChangeText={(referenceRange) => setForm((current) => ({ ...current, referenceRange }))} placeholder="Opcional" maxLength={100} />
            <Field styles={styles} label="Observação" value={form.note} onChangeText={(note) => setForm((current) => ({ ...current, note }))} placeholder="Opcional" maxLength={240} multiline />
            {!!formError && <Text accessibilityRole="alert" style={styles.errorText}>{formError}</Text>}
            <ActionButton styles={styles} icon={saving ? 'hourglass-outline' : 'save-outline'} label={saving ? 'Salvando…' : editingExamId ? 'Salvar alterações' : 'Salvar exame'} onPress={saveExam} disabled={saving || !ready} />
            {editingExamId ? <TextButton styles={styles} label="Cancelar edição" onPress={cancelExamEdit} /> : null}
          </View>
          {ready && exams.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={28} color={colors.textMuted} />
              <Text style={styles.body}>Seus exames salvos aparecerão aqui.</Text>
            </View>
          ) : null}
          {exams.map((exam) => (
            <View key={exam.id} style={styles.examCard}>
              <View style={styles.examHeading}>
                <View style={styles.examTitleWrap}>
                  <Text style={styles.examName}>{exam.name}</Text>
                  {exam.date ? <Text style={styles.examDate}>{formatDate(exam.date)}</Text> : null}
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${exam.name}`} onPress={() => startExamEdit(exam)} style={styles.iconButton}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Excluir ${exam.name}`} onPress={() => { setPendingDeleteId(exam.id); setFormError(''); }} style={styles.iconButton}>
                  <Ionicons name="trash-outline" size={20} color={RED} />
                </Pressable>
              </View>
              <Text style={styles.examResult}>Resultado: {exam.result}{exam.unit ? ` ${exam.unit}` : ''}</Text>
              {exam.referenceRange ? <Text style={styles.examMeta}>Referência do laudo: {exam.referenceRange}</Text> : null}
              {exam.note ? <Text style={styles.examMeta}>Observação: {exam.note}</Text> : null}
              {pendingDeleteId === exam.id ? (
                <View style={styles.deleteConfirm}>
                  <Text style={styles.body}>Excluir este registro?</Text>
                  <View style={styles.confirmActions}>
                    <TextButton styles={styles} label="Manter" onPress={() => setPendingDeleteId(null)} />
                    <Pressable accessibilityRole="button" disabled={saving} onPress={() => confirmDelete(exam.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>{saving ? 'Excluindo…' : 'Excluir'}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          ))}
          <Text style={styles.privacyNote}>Os registros ficam salvos localmente neste aparelho. Eles não são enviados para um servidor.</Text>
        </SectionCard>

        <Text style={styles.footerNote}>Use este espaço para organizar suas informações. Em caso de dúvidas sobre exames, procure um profissional de saúde.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 44, gap: 16, width: '100%', maxWidth: 720, alignSelf: 'center' },
  card: { padding: 20, backgroundColor: colors.surface, borderRadius: 22, gap: 15 },
  summary: { alignItems: 'center', paddingVertical: 24 },
  icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.3, color: colors.textMuted, textAlign: 'center' },
  bloodType: { fontSize: 58, fontWeight: '800', color: RED },
  emptyType: { fontSize: 24, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 21, color: colors.textMuted, flexShrink: 1 },
  center: { textAlign: 'center' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.textDark },
  sectionText: { fontSize: 14, lineHeight: 21, color: colors.textMuted },
  smallNote: { fontSize: 12, lineHeight: 18, color: colors.textMuted },
  emphasis: { fontWeight: '800', color: colors.textDark },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoTile: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 13, borderRadius: 14, backgroundColor: '#FFF7F7' },
  infoText: { flex: 1, gap: 3 },
  infoTitle: { fontSize: 14, fontWeight: '800', color: colors.textDark },
  bloodTypeEditor: { width: '100%', gap: 12 },
  typePicker: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  typeOption: { minWidth: 52, minHeight: 44, paddingHorizontal: 11, borderRadius: 12, borderWidth: 1, borderColor: colors.inputBorder, alignItems: 'center', justifyContent: 'center' },
  typeOptionSelected: { backgroundColor: RED, borderColor: RED },
  typeOptionText: { color: colors.textDark, fontWeight: '700', fontSize: 14 },
  typeOptionTextSelected: { color: colors.white },
  personalCompatibility: { gap: 7, padding: 14, borderRadius: 14, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3' },
  personalTitle: { color: RED, fontSize: 15, fontWeight: '800' },
  prompt: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#EFF6FF' },
  promptText: { flex: 1, color: colors.primary, fontSize: 13, lineHeight: 19 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderColor: colors.border },
  tableHeading: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
  tableRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingVertical: 8, paddingHorizontal: 5, borderBottomWidth: 1, borderColor: colors.border, gap: 5 },
  tableRowSelected: { backgroundColor: '#FFF1F2', borderRadius: 10, borderBottomColor: '#FECDD3' },
  typeColumn: { width: 48 },
  compatColumn: { flex: 1 },
  tableType: { fontSize: 13, fontWeight: '800', color: colors.textDark },
  tableValue: { fontSize: 11, lineHeight: 15, color: colors.textMedium },
  caution: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 12, borderRadius: 12, backgroundColor: '#FFF7ED' },
  cautionText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#7C2D12' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: { width: 7, height: 7, borderRadius: 4, backgroundColor: RED, marginTop: 7 },
  bulletText: { flex: 1 },
  form: { padding: 16, backgroundColor: '#FFF8F8', borderRadius: 16, gap: 11 },
  field: { gap: 5 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  input: { minHeight: 46, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 11, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.white, color: colors.textDark, fontSize: 14 },
  multilineInput: { minHeight: 82 },
  button: { minHeight: 48, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: RED, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { color: colors.white, fontWeight: '800', fontSize: 14, flexShrink: 1, textAlign: 'center' },
  textButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  textButtonLabel: { color: colors.primary, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.75 },
  errorText: { color: colors.error, fontSize: 13, lineHeight: 18 },
  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 18 },
  examCard: { padding: 15, borderRadius: 15, backgroundColor: colors.background, gap: 8 },
  examHeading: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  examTitleWrap: { flex: 1, gap: 3 },
  examName: { color: colors.textDark, fontSize: 15, fontWeight: '800' },
  examDate: { color: colors.textMuted, fontSize: 12 },
  examResult: { color: colors.textDark, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  examMeta: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.white },
  deleteConfirm: { gap: 6, paddingTop: 8 },
  confirmActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  deleteButton: { minHeight: 40, paddingHorizontal: 14, borderRadius: 11, backgroundColor: RED, alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  privacyNote: { fontSize: 11, lineHeight: 16, color: colors.textMuted },
  footerNote: { textAlign: 'center', paddingHorizontal: 12, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});

