import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../services/api';

const STORAGE_KEY = '@saude/nutrition/v1';
const NUTRIENTS = ['calories', 'carbohydrates', 'protein', 'fat', 'sugar'];
const EMPTY_DATA = { catalog: [], favorites: [], entries: [] };

function normalizeFruit(item) {
  if (!item || (item.id == null) || typeof item.name !== 'string' || !item.nutritions) return null;
  const nutrition = {};
  for (const key of NUTRIENTS) {
    const value = Number(item.nutritions[key]);
    if (!Number.isFinite(value) || value < 0) return null;
    nutrition[key] = value;
  }
  return {
    id: String(item.id),
    name: item.name.trim(),
    family: typeof item.family === 'string' ? item.family : '',
    genus: typeof item.genus === 'string' ? item.genus : '',
    order: typeof item.order === 'string' ? item.order : '',
    nutritions: nutrition,
  };
}

function normalizeSavedData(value) {
  if (!value || typeof value !== 'object') return EMPTY_DATA;
  const catalog = Array.isArray(value.catalog) ? value.catalog.map(normalizeFruit).filter(Boolean) : [];
  const favorites = Array.isArray(value.favorites) ? value.favorites.map(String) : [];
  const entries = Array.isArray(value.entries) ? value.entries.filter((entry) =>
    entry && typeof entry.id === 'string' && typeof entry.fruitId === 'string' &&
    typeof entry.name === 'string' && Number.isFinite(entry.grams) && entry.grams > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && entry.nutritions &&
    NUTRIENTS.every((key) => Number.isFinite(entry.nutritions[key]))
  ) : [];
  return { catalog, favorites: [...new Set(favorites)], entries };
}

export function getLocalDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function scaledNutrition(nutritions, grams) {
  const factor = grams / 100;
  return Object.fromEntries(NUTRIENTS.map((key) => [key, Math.round(nutritions[key] * factor * 10) / 10]));
}

export default function useNutritionData() {
  const [data, setData] = useState(EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [requestNumber, setRequestNumber] = useState(0);
  const writes = useRef(Promise.resolve());
  const skipFirstWrite = useRef(true);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (active && saved) setData(normalizeSavedData(JSON.parse(saved)));
      })
      .catch(() => {
        if (active) setStorageError('Não foi possível carregar os dados salvos neste aparelho.');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    writes.current = writes.current.catch(() => {}).then(() =>
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    ).then(() => setStorageError('')).catch(() => {
      setStorageError('Não foi possível salvar as alterações neste aparelho.');
    });
  }, [data, ready]);

  const refreshFruits = useCallback(async () => {
    setApiLoading(true);
    setApiError('');
    try {
      const response = await apiRequest('/api/fruits');
      if (!Array.isArray(response)) throw new Error('Resposta de frutas inválida');
      const catalog = response.map(normalizeFruit).filter(Boolean);
      if (!catalog.length) throw new Error('A lista de frutas veio vazia');
      setData((current) => ({ ...current, catalog }));
      setUpdatedAt(new Date());
    } catch {
      setApiError(dataRef.current.catalog.length
        ? 'Não foi possível atualizar. Exibindo a última lista salva.'
        : 'Não foi possível carregar as frutas. Confira a conexão e tente novamente.');
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) refreshFruits();
  }, [ready, requestNumber, refreshFruits]);

  const toggleFavorite = useCallback((fruitId) => {
    const id = String(fruitId);
    setData((current) => ({
      ...current,
      favorites: current.favorites.includes(id)
        ? current.favorites.filter((favoriteId) => favoriteId !== id)
        : [...current.favorites, id],
    }));
  }, []);

  const addEntry = useCallback(({ fruit, grams, date }) => {
    const normalized = normalizeFruit(fruit);
    if (!normalized || !Number.isFinite(grams) || grams <= 0) return false;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fruitId: normalized.id,
      name: normalized.name,
      grams,
      date,
      nutritions: scaledNutrition(normalized.nutritions, grams),
    };
    setData((current) => ({ ...current, entries: [entry, ...current.entries] }));
    return true;
  }, []);

  const removeEntry = useCallback((entryId) => {
    setData((current) => ({ ...current, entries: current.entries.filter((entry) => entry.id !== entryId) }));
  }, []);

  const retry = useCallback(() => setRequestNumber((value) => value + 1), []);

  return {
    ...data,
    ready,
    apiLoading,
    apiError,
    storageError,
    updatedAt,
    toggleFavorite,
    addEntry,
    removeEntry,
    retry,
  };
}
