import React, { useCallback, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import ProfileStat from '../components/ProfileStat';
import LabeledInput from '../components/LabeledInput';
import GradientButton from '../components/GradientButton';
import { useProfile } from '../context/ProfileContext';
import { colors } from '../constants/theme';
import { apiRequest } from '../services/api';
import { formatBrazilDate } from '../utils/date';

const BLOOD_TYPES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RECORD_KEYS = [
  ['pressure', '@saude/blood-pressure/v1'], ['medicines', '@saude/medicines/v1'],
  ['allergies', '@saude/allergies/v1'], ['vaccines', '@saude/vaccines/v1'],
  ['exams', '@saude/blood-exams/v1'], ['nutrition', '@saude/nutrition/v1'], ['water', '@saude/water/v1'],
];

function displayDate(value) {
  if (!value) return '';
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? formatBrazilDate(value) : value;
}

function RecordSection({ title, icon, records, emptyText, renderRecord, error }) {
  return (
    <View style={styles.recordSection}>
      <View style={styles.recordHeading}>
        <Ionicons name={icon} size={19} color={colors.primary} />
        <Text style={styles.recordTitle}>{title}</Text>
        <Text style={styles.recordCount}>{records.length}</Text>
      </View>
      {error ? <Text style={styles.recordEmpty}>{error}</Text> : records.length ? records.map((record, index) => (
        <View key={String(record.id || index)} style={styles.recordItem}>{renderRecord(record)}</View>
      )) : <Text style={styles.recordEmpty}>{emptyText}</Text>}
    </View>
  );
}

export default function PerfilScreen({ navigation }) {
  const { profile, updateProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');
  const [picking, setPicking] = useState(false);
  const [records, setRecords] = useState({ pressure: [], medicines: [], allergies: [], vaccines: [], exams: [], nutrition: [], water: [], glucose: [] });
  const [glucoseError, setGlucoseError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    async function loadRecords() {
      const stored = await Promise.all(RECORD_KEYS.map(async ([name, key]) => {
        try {
          const value = await AsyncStorage.getItem(key);
          const parsed = value ? JSON.parse(value) : [];
          if (name === 'nutrition') return [name, Array.isArray(parsed.entries) ? parsed.entries : []];
          if (name === 'water') return [name, Array.isArray(parsed.logs) ? parsed.logs.map((item) => ({ ...item, goal: parsed.goal })) : []];
          return [name, Array.isArray(parsed) ? parsed : []];
        } catch { return [name, []]; }
      }));
      if (active) setRecords((current) => ({ ...current, ...Object.fromEntries(stored) }));
      let glucose = [];
      let errorMessage = '';
      try {
        const response = await apiRequest('/api/glucose');
        glucose = Array.isArray(response.readings) ? response.readings : [];
      } catch { errorMessage = 'Não foi possível carregar as medidas agora.'; }
      if (active) {
        setRecords((current) => ({ ...current, glucose }));
        setGlucoseError(errorMessage);
      }
    }
    loadRecords();
    return () => { active = false; };
  }, []));

  const pickPhoto = async () => {
    setError('');
    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        // Store the image itself so a temporary picker URI cannot expire after restarting.
        if (!asset.base64) throw new Error('Imagem indisponível');
        if (asset.base64.length > 1500000) {
          setError('Esta foto é muito grande. Escolha uma imagem menor.');
          return;
        }
        updateProfile({ photo: `data:image/jpeg;base64,${asset.base64}` });
      }
    } catch {
      setError('Não foi possível abrir a foto. Tente novamente e verifique o acesso às fotos nas configurações.');
    } finally {
      setPicking(false);
    }
  };

  const save = () => {
    const name = draft.name.trim();
    const email = draft.email.trim();
    const age = draft.age.trim();
    if (!name) return setError('Informe seu nome.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Informe um e-mail válido.');
    if (age && (!/^\d{1,3}$/.test(age) || Number(age) > 130)) return setError('Informe uma idade entre 0 e 130 anos.');
    updateProfile({ name, email, age, bloodType: draft.bloodType });
    setEditing(false);
    setError('');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Meu perfil" subtitle="Suas informações em um só lugar" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.identity}>
            <Pressable accessibilityRole="button" accessibilityLabel="Escolher ou trocar foto de perfil" disabled={picking} onPress={pickPhoto} style={styles.photoButton}>
              {profile.photo ? <Image source={{ uri: profile.photo }} style={styles.photo} /> : <Ionicons name="person" size={58} color={colors.primary} />}
              <View style={styles.camera}><Ionicons name="camera" size={18} color={colors.white} /></View>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={picking} onPress={pickPhoto}><Text style={styles.link}>{picking ? 'Abrindo foto…' : profile.photo ? 'Trocar foto' : 'Adicionar foto'}</Text></Pressable>
            {!!profile.photo && <Pressable accessibilityRole="button" disabled={picking} onPress={() => updateProfile({ photo: null })}><Text style={styles.remove}>Remover foto</Text></Pressable>}
            <Text style={styles.name}>{profile.name || 'Seu nome'}</Text>
            <Text style={styles.email}>{profile.email || 'E-mail não informado'}</Text>
          </View>

          <View style={styles.stats}>
            <ProfileStat styles={styles} icon="calendar-outline" label="Idade" value={profile.age !== '' ? `${profile.age} anos` : 'Não informada'} />
            <ProfileStat styles={styles} icon="water-outline" label="Tipo sanguíneo" value={profile.bloodType || 'Não informado'} />
            <ProfileStat styles={styles} icon="scale-outline" label="Peso" value={profile.weight != null ? `${profile.weight.toLocaleString('pt-BR')} kg` : 'Não informado'} />
            <ProfileStat styles={styles} icon="resize-outline" label="Altura" value={profile.height != null ? `${profile.height.toLocaleString('pt-BR')} cm` : 'Não informada'} />
            <ProfileStat styles={styles} icon="speedometer-outline" label="IMC" value={profile.bmi != null ? profile.bmi.toLocaleString('pt-BR') : 'Não calculado'} />
          </View>
          <Text style={styles.hint}>O peso e a altura são atualizados automaticamente ao calcular o IMC ou a meta de água com novos dados.</Text>

          <Text style={styles.recordsHeading}>Meus registros de saúde</Text>
          <Text style={styles.hint}>Dados registrados nas outras telas, reunidos aqui.</Text>
          <RecordSection title="Glicemia" icon="pulse-outline" records={records.glucose} error={glucoseError} emptyText="Nenhuma medida registrada." renderRecord={(item) => <><Text style={styles.recordMain}>{item.value} mg/dL · {item.context}</Text><Text style={styles.recordMeta}>{displayDate(item.date)} {item.time ? `às ${item.time}` : ''}{item.note ? ` · ${item.note}` : ''}</Text></>} />
          <RecordSection title="Pressão arterial" icon="heart-outline" records={records.pressure} emptyText="Nenhuma medida registrada." renderRecord={(item) => <><Text style={styles.recordMain}>{item.systolic}/{item.diastolic} mmHg{item.pulse ? ` · pulso ${item.pulse}` : ''}</Text><Text style={styles.recordMeta}>{displayDate(item.date)} {item.time ? `às ${item.time}` : ''}{item.arm ? ` · ${item.arm}` : ''}{item.note ? ` · ${item.note}` : ''}</Text></>} />
          <RecordSection title="Medicamentos" icon="medkit-outline" records={records.medicines} emptyText="Nenhum medicamento cadastrado." renderRecord={(item) => <><Text style={styles.recordMain}>{item.name}{item.dosage ? ` · ${item.dosage}` : ''}</Text><Text style={styles.recordMeta}>{[item.frequency, item.time, item.route, item.instructions].filter(Boolean).join(' · ')}</Text></>} />
          <RecordSection title="Alergias" icon="warning-outline" records={records.allergies} emptyText="Nenhuma alergia cadastrada." renderRecord={(item) => <><Text style={styles.recordMain}>{item.name} · {item.severity || item.type}</Text><Text style={styles.recordMeta}>{[item.type, item.symptoms, item.emergencyPlan].filter(Boolean).join(' · ')}</Text></>} />
          <RecordSection title="Vacinas" icon="fitness-outline" records={records.vaccines} emptyText="Nenhuma vacina registrada." renderRecord={(item) => <><Text style={styles.recordMain}>{item.name}{item.dose ? ` · ${item.dose}` : ''}</Text><Text style={styles.recordMeta}>{[displayDate(item.date), item.lot && `Lote ${item.lot}`, item.place, item.professional, item.nextDate && `Próxima dose: ${displayDate(item.nextDate)}`, item.note].filter(Boolean).join(' · ')}</Text></>} />
          <RecordSection title="Exames de sangue" icon="water-outline" records={records.exams} emptyText="Nenhum exame registrado." renderRecord={(item) => <><Text style={styles.recordMain}>{item.name}: {item.result}{item.unit ? ` ${item.unit}` : ''}</Text><Text style={styles.recordMeta}>{[displayDate(item.date), item.referenceRange && `Referência: ${item.referenceRange}`, item.note].filter(Boolean).join(' · ')}</Text></>} />
          <RecordSection title="Água" icon="water-outline" records={records.water} emptyText="Nenhuma ingestão registrada hoje." renderRecord={(item) => <><Text style={styles.recordMain}>{item.amount} ml</Text><Text style={styles.recordMeta}>{item.time}{item.goal ? ` · meta diária: ${item.goal} ml` : ''}</Text></>} />
          <RecordSection title="Alimentação" icon="restaurant-outline" records={records.nutrition} emptyText="Nenhum alimento registrado." renderRecord={(item) => <><Text style={styles.recordMain}>{item.name} · {item.grams} g</Text><Text style={styles.recordMeta}>{[displayDate(item.date), item.nutritions && `${item.nutritions.calories} kcal · proteínas ${item.nutritions.protein} g · carboidratos ${item.nutritions.carbohydrates} g`].filter(Boolean).join(' · ')}</Text></>} />

          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          {editing ? (
            <View style={styles.form}>
              <Text style={styles.heading}>Dados pessoais</Text>
              <LabeledInput label="Nome" keyboardType="default" autoCapitalize="words" maxLength={100} value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} />
              <LabeledInput label="E-mail" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254} value={draft.email} onChangeText={(email) => setDraft({ ...draft, email })} />
              <LabeledInput label="Idade (anos)" keyboardType="number-pad" maxLength={3} value={draft.age} onChangeText={(age) => setDraft({ ...draft, age })} />
              <Text style={styles.hint}>Tipo sanguíneo</Text>
              <View style={styles.types}>{BLOOD_TYPES.map((type) => (
                <Pressable key={type} accessibilityRole="radio" accessibilityState={{ checked: draft.bloodType === type }} onPress={() => setDraft({ ...draft, bloodType: type })} style={[styles.type, draft.bloodType === type && styles.selected]}>
                  <Text style={{ color: draft.bloodType === type ? colors.white : colors.textDark }}>{type || 'Não sei'}</Text>
                </Pressable>
              ))}</View>
              <GradientButton label="Salvar perfil" onPress={save} />
              <Pressable accessibilityRole="button" onPress={() => { setEditing(false); setError(''); }}><Text style={styles.cancel}>Cancelar</Text></Pressable>
            </View>
          ) : <GradientButton label="Editar dados pessoais" onPress={() => { setDraft({ name: profile.name, email: profile.email, age: profile.age, bloodType: profile.bloodType }); setEditing(true); setError(''); }} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40, gap: 18 },
  identity: { alignItems: 'center', padding: 22, backgroundColor: colors.surface, borderRadius: 22, gap: 10 },
  photoButton: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#E8EEF9', justifyContent: 'center', alignItems: 'center' },
  photo: { width: 112, height: 112, borderRadius: 56 },
  camera: { position: 'absolute', right: 0, bottom: 0, backgroundColor: colors.primary, padding: 8, borderRadius: 20, borderWidth: 3, borderColor: colors.white },
  link: { color: colors.primary, fontWeight: '700', padding: 8 },
  remove: { color: colors.textMuted, padding: 6 },
  name: { color: colors.textDark, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  email: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { flex: 1, minWidth: 90, paddingVertical: 18, paddingHorizontal: 6, backgroundColor: colors.surface, borderRadius: 16, alignItems: 'center', gap: 8 },
  statValue: { fontSize: 15, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  statLabel: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  hint: { fontSize: 13, lineHeight: 20, color: colors.textMuted },
  recordsHeading: { fontSize: 19, fontWeight: '800', color: colors.textDark, marginTop: 4 },
  recordSection: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 8 },
  recordHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 4 },
  recordTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.textDark },
  recordCount: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  recordItem: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 9 },
  recordMain: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  recordMeta: { marginTop: 3, fontSize: 11.5, lineHeight: 17, color: colors.textMuted },
  recordEmpty: { fontSize: 12, color: colors.textMuted },
  error: { color: colors.error, lineHeight: 20 },
  form: { backgroundColor: colors.surface, padding: 20, borderRadius: 20, gap: 12 },
  heading: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  type: { minWidth: 48, minHeight: 44, padding: 12, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.primary },
  cancel: { color: colors.textMuted, padding: 12, textAlign: 'center' },
});

