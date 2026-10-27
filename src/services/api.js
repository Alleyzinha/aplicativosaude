import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const defaultApiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, '');
const TOKEN_KEY = '@saude/auth-token/v1';

export async function apiRequest(path, options = {}) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Confira a conexão e o endereço da API.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Não foi possível concluir a solicitação.');
  return payload;
}

export async function authenticate(endpoint, credentials) {
  const result = await apiRequest(`/api/auth/${endpoint}`, {
    method: 'POST', body: JSON.stringify(credentials),
  });
  await AsyncStorage.setItem(TOKEN_KEY, result.token);
  return result.user;
}
