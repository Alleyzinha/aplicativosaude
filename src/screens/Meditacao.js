import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Header from '../components/Header';
import { colors } from '../constants/theme';

const sessions = [
  { id: 'relax', title: 'Relaxamento', description: 'Solte tensões e desacelere.', icon: 'leaf-outline', minutes: 5, tone: '#6D5AA7' },
  { id: 'breath', title: 'Respiração', description: 'Encontre um ritmo calmo.', icon: 'pulse-outline', minutes: 3, tone: '#2B7A78' },
  { id: 'sleep', title: 'Sono', description: 'Prepare corpo e mente.', icon: 'moon-outline', minutes: 10, tone: '#4F5D95' },
  { id: 'focus', title: 'Foco', description: 'Concentre-se no presente.', icon: 'eye-outline', minutes: 15, tone: '#B96A45' },
];

const sounds = [
  { id: 'rain', title: 'Chuva', icon: 'rainy-outline', source: require('../../assets/sounds/chuva.ogg') },
  { id: 'cafe', title: 'Ambiente suave', icon: 'cafe-outline', source: require('../../assets/sounds/cafe.ogg') },
  { id: 'music', title: 'Música relaxante', icon: 'musical-notes-outline', source: require('../../assets/sounds/musica.mp3') },
];

export default function MeditacaoScreen({ navigation }) {
  const [selectedSession, setSelectedSession] = useState(sessions[0]);
  const [selectedSound, setSelectedSound] = useState(sounds[0]);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(sessions[0].minutes * 60);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customError, setCustomError] = useState('');
  const [totalSeconds, setTotalSeconds] = useState(sessions[0].minutes * 60);
  const soundRef = useRef(null);

  useEffect(() => {
    const duration = selectedSession.minutes * 60;
    setTotalSeconds(duration);
    setSecondsLeft(duration);
    setCustomMinutes('');
    setCustomError('');
    setRunning(false);
  }, [selectedSession]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setRunning(false);
          stopAudio();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => () => {
    soundRef.current?.unloadAsync();
  }, []);

  async function stopAudio() {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }

  async function startOrPause() {
    if (running) {
      setRunning(false);
      if (soundRef.current) await soundRef.current.pauseAsync();
      return;
    }

    if (secondsLeft === 0) setSecondsLeft(totalSeconds);

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      staysActiveInBackground: false,
    });

    if (soundRef.current) {
      await soundRef.current.playAsync();
    } else {
      const { sound } = await Audio.Sound.createAsync(
        selectedSound.source,
        { shouldPlay: true, isLooping: true, volume: 1 },
      );
      soundRef.current = sound;
    }
    setRunning(true);
  }

  async function changeSound(sound) {
    setSelectedSound(sound);
    if (soundRef.current) {
      await stopAudio();
    }
    if (running) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        sound.source,
        { shouldPlay: true, isLooping: true, volume: 1 },
      );
      soundRef.current = newSound;
    }
  }

  function resetSession() {
    setRunning(false);
    setSecondsLeft(totalSeconds);
    stopAudio();
  }

  function applyCustomTime() {
    const value = Number(customMinutes);
    if (!Number.isInteger(value) || value < 1 || value > 180) {
      setCustomError('Informe um tempo entre 1 e 180 minutos.');
      return;
    }
    setRunning(false);
    const duration = value * 60;
    setTotalSeconds(duration);
    setSecondsLeft(duration);
    setCustomError('');
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#30304A" />
      <Header title="Meditação" subtitle="Respire, desacelere e volte ao presente" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.playerCard, { borderColor: `${selectedSession.tone}55` }]}>
          <View style={styles.moodRow}>
            <View style={[styles.moodIcon, { backgroundColor: `${selectedSession.tone}22` }]}>
              <Ionicons name={selectedSession.icon} size={30} color={selectedSession.tone} />
            </View>
            <View style={styles.moodText}>
              <Text style={styles.moodTitle}>{selectedSession.title}</Text>
              <Text style={styles.moodDescription}>{selectedSession.description}</Text>
            </View>
          </View>

          <View style={styles.timerWrap}>
            <View style={[styles.timerRing, { borderColor: `${selectedSession.tone}33` }]}>
              <View style={[styles.timerProgress, { borderTopColor: selectedSession.tone, transform: [{ rotate: `${progress * 360}deg` }] }]} />
              <Text style={styles.timerText}>{minutes}:{seconds}</Text>
              <Text style={styles.timerLabel}>{running ? 'Em prática' : secondsLeft === 0 ? 'Concluído' : 'Pronto'}</Text>
            </View>
          </View>

          <View style={styles.playerActions}>
            <Pressable onPress={resetSession} style={styles.secondaryAction} accessibilityLabel="Reiniciar sessão">
              <Ionicons name="refresh-outline" size={22} color={selectedSession.tone} />
            </Pressable>
            <Pressable
              onPress={startOrPause}
              style={({ pressed }) => [styles.playButton, { backgroundColor: selectedSession.tone }, pressed && styles.pressed]}
              accessibilityLabel={running ? 'Pausar meditação' : 'Iniciar meditação'}
            >
              <Ionicons name={running ? 'pause' : 'play'} size={28} color={colors.white} />
            </Pressable>
            <View style={styles.secondaryActionPlaceholder} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tipo de sessão</Text>
        <View style={styles.sessionGrid}>
          {sessions.map((session) => (
            <Pressable
              key={session.id}
              onPress={() => setSelectedSession(session)}
              style={({ pressed }) => [
                styles.sessionCard,
                selectedSession.id === session.id && { borderColor: session.tone, backgroundColor: `${session.tone}12` },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={session.icon} size={22} color={selectedSession.id === session.id ? session.tone : colors.textMuted} />
              <Text style={[styles.sessionName, selectedSession.id === session.id && { color: session.tone }]}>{session.title}</Text>
              <Text style={styles.sessionTime}>{session.minutes} min</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.customCard}>
          <View style={styles.customHeader}>
            <View>
              <Text style={styles.customTitle}>Tempo personalizado</Text>
              <Text style={styles.customSubtitle}>Escolha de 1 a 180 minutos</Text>
            </View>
            <Ionicons name="time-outline" size={22} color={selectedSession.tone} />
          </View>
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              value={customMinutes}
              onChangeText={(value) => { setCustomMinutes(value.replace(/[^0-9]/g, '')); setCustomError(''); }}
              placeholder="Ex.: 20"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.minutesText}>minutos</Text>
            <Pressable
              onPress={applyCustomTime}
              style={({ pressed }) => [styles.customButton, { backgroundColor: selectedSession.tone }, pressed && styles.pressed]}
            >
              <Ionicons name="checkmark" size={18} color={colors.white} />
              <Text style={styles.customButtonText}>Aplicar</Text>
            </Pressable>
          </View>
          {!!customError && <Text style={styles.customError}>{customError}</Text>}
        </View>

        <Text style={styles.sectionTitle}>Música ambiente</Text>
        <View style={styles.soundList}>
          {sounds.map((sound) => {
            const selected = selectedSound.id === sound.id;
            return (
              <Pressable
                key={sound.id}
                onPress={() => changeSound(sound)}
                style={({ pressed }) => [styles.soundItem, selected && styles.soundSelected, pressed && styles.pressed]}
              >
                <View style={[styles.soundIcon, selected && styles.soundIconSelected]}>
                  <Ionicons name={sound.icon} size={21} color={selected ? colors.white : colors.textMuted} />
                </View>
                <Text style={[styles.soundName, selected && styles.soundNameSelected]}>{sound.title}</Text>
                <Ionicons name={selected ? 'musical-notes' : 'chevron-forward'} size={18} color={selected ? selectedSession.tone : colors.textPlaceholder} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={20} color="#667085" />
          <Text style={styles.tipText}>Sente-se confortavelmente. Mantenha os ombros relaxados e respire pelo nariz em um ritmo natural.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7FB' },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 36 },
  playerCard: {
    borderRadius: 24, padding: 18, backgroundColor: colors.white,
    borderWidth: 1, shadowColor: '#30304A', shadowOpacity: 0.08,
    shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  moodRow: { flexDirection: 'row', alignItems: 'center' },
  moodIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  moodText: { flex: 1, marginLeft: 12 },
  moodTitle: { fontSize: 17, fontWeight: '900', color: colors.textDark },
  moodDescription: { marginTop: 3, fontSize: 12.5, color: colors.textMuted },
  timerWrap: { alignItems: 'center', marginVertical: 18 },
  timerRing: {
    width: 180, height: 180, borderRadius: 90, borderWidth: 8,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCFCFE',
  },
  timerProgress: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    borderWidth: 8, borderColor: 'transparent',
  },
  timerText: { fontSize: 42, fontWeight: '300', letterSpacing: 1, color: colors.textDark },
  timerLabel: { marginTop: 4, fontSize: 12, fontWeight: '700', color: colors.textMuted },
  playerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secondaryAction: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F7' },
  secondaryActionPlaceholder: { width: 46 },
  playButton: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.72 },
  sectionTitle: { marginTop: 22, marginBottom: 10, fontSize: 15, fontWeight: '900', color: colors.textDark },
  sessionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sessionCard: {
    width: '48.2%', minHeight: 96, borderRadius: 16, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.white, padding: 12,
  },
  sessionName: { marginTop: 8, fontSize: 13.5, fontWeight: '800', color: colors.textMedium },
  sessionTime: { marginTop: 3, fontSize: 11.5, color: colors.textMuted },
  customCard: {
    marginTop: 18, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.white, padding: 16, paddingTop: 14, paddingBottom: 18,
  },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  customTitle: { fontSize: 15, fontWeight: '900', color: colors.textDark },
  customSubtitle: { marginTop: 2, fontSize: 12, color: colors.textMuted },
  customRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  customInput: {
    flex: 1, minWidth: 76, height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    backgroundColor: '#F9F9FB', paddingHorizontal: 12, fontSize: 16, color: colors.textDark,
  },
  minutesText: { fontSize: 14, color: colors.textMedium },
  customButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 48, borderRadius: 12, paddingHorizontal: 12,
  },
  customButtonText: { marginLeft: 6, fontSize: 14, fontWeight: '700', color: colors.white },
  customError: { marginTop: 8, fontSize: 12, color: '#FF6B6B' },
  soundList: { gap: 8 },
  soundItem: {
    minHeight: 58, flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 10,
  },
  soundSelected: { borderColor: '#D8D2E8', backgroundColor: '#F9F7FF' },
  soundIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F3F5' },
  soundIconSelected: { backgroundColor: '#6D5AA7' },
  soundName: { flex: 1, marginLeft: 10, fontSize: 13.5, fontWeight: '700', color: colors.textMedium },
  soundNameSelected: { color: colors.textDark },
  tipCard: {
    marginTop: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderRadius: 14, backgroundColor: '#EEF2F6', padding: 12,
  },
  tipText: { flex: 1, fontSize: 12, lineHeight: 17, color: '#667085' },
});
