import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saude/vaccines/v1';

function sortVaccines(records) {
  return [...records].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.id || '').localeCompare(a.id || ''));
}

export default function useVaccines() {
  const [vaccines, setVaccines] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const records = useRef([]);
  const writes = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!active || !saved) return;
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) throw new Error('Invalid vaccine list');
        const loaded = sortVaccines(parsed);
        records.current = loaded;
        setVaccines(loaded);
      })
      .catch(() => { if (active) setError('Não foi possível carregar sua carteira de vacinação.'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const commit = useCallback((next) => {
    const sorted = sortVaccines(next);
    records.current = sorted;
    setVaccines(sorted);
    setError('');
    writes.current = writes.current.catch(() => {}).then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted)));
    return writes.current.then(() => true).catch(() => { setError('Não foi possível salvar no aparelho.'); return false; });
  }, []);

  const add = useCallback((vaccine) => {
    const item = { ...vaccine, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    return commit([item, ...records.current]);
  }, [commit]);

  const update = useCallback((id, changes) => {
    return commit(records.current.map((item) => item.id === id ? { ...item, ...changes, id } : item));
  }, [commit]);

  const remove = useCallback((id) => commit(records.current.filter((item) => item.id !== id)), [commit]);

  return { vaccines, ready, error, add, update, remove };
}
