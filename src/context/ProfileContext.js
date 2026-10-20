import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileContext = createContext(null);
const STORAGE_KEY = '@saude/profile/v1';
const EMPTY_PROFILE = { name: '', email: '', age: '', bloodType: '', photo: null, weight: null, height: null };

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const writes = useRef(Promise.resolve());
  const initialLoad = useRef(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setProfile({ ...EMPTY_PROFILE, ...JSON.parse(saved) });
    }).catch(() => setStorageError('Não foi possível carregar o perfil salvo.'))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    writes.current = writes.current.then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)))
      .catch(() => setStorageError('Não foi possível salvar o perfil no aparelho.'));
  }, [profile, ready]);

  const updateProfile = (changes) => setProfile((previous) => ({ ...previous, ...changes }));

  if (!ready) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Carregando perfil" /></View>;

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {storageError ? <Text accessibilityRole="alert" style={{ padding: 12, color: '#B91C1C' }}>{storageError}</Text> : null}
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
