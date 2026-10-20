import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import ProfileStat from '../components/ProfileStat';
import LabeledInput from '../components/LabeledInput';
import GradientButton from '../components/GradientButton';
import { useProfile } from '../context/ProfileContext';
import { colors } from '../constants/theme';

const BLOOD_TYPES = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PerfilScreen({ navigation }) {
  const { profile, updateProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');
  const [picking, setPicking] = useState(false);

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
          </View>
          <Text style={styles.hint}>O peso e a altura são atualizados automaticamente ao calcular o IMC ou a meta de água com novos dados.</Text>

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
  error: { color: colors.error, lineHeight: 20 },
  form: { backgroundColor: colors.surface, padding: 20, borderRadius: 20, gap: 12 },
  heading: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  type: { minWidth: 48, minHeight: 44, padding: 12, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.primary },
  cancel: { color: colors.textMuted, padding: 12, textAlign: 'center' },
});

