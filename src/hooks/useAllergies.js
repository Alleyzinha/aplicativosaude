import { useEffect, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayBrazil } from '../utils/date';

const STORAGE_KEY = '@saude/allergies/v1';
const EMPTY_FORM = {
  name: '', type: 'Medicamento', severity: 'Leve', symptoms: '', diagnosedBy: '', date: todayBrazil(), emergencyPlan: '',
};

export default function useAllergies() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [allergies, setAllergies] = useState([]);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const records = useRef([]);
  const writes = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!active || !saved) return;
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) throw new Error('Invalid allergies');
        records.current = parsed;
        setAllergies(parsed);
      })
      .catch(() => { if (active) setError('Não foi possível carregar as alergias salvas neste aparelho.'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const commit = useCallback((next) => {
    records.current = next;
    setAllergies(next);
    setError('');
    writes.current = writes.current.catch(() => {}).then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)));
    return writes.current.then(() => true).catch(() => { setError('Não foi possível salvar neste aparelho.'); return false; });
  }, []);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError('');
  };

  const add = async () => {
    if (!form.name.trim()) { setError('Informe o nome da alergia ou substância.'); return false; }
    if (!form.symptoms.trim()) { setError('Informe pelo menos um sintoma conhecido.'); return false; }
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...form,
      name: form.name.trim(), symptoms: form.symptoms.trim(), diagnosedBy: form.diagnosedBy.trim(),
      date: form.date.trim(), emergencyPlan: form.emergencyPlan.trim(),
    };
    if (!(await commit([item, ...records.current]))) return false;
    setForm(EMPTY_FORM);
    return true;
  };

  const update = async (id, changes) => {
    const next = records.current.map((item) => item.id === id ? { ...item, ...changes } : item);
    return commit(next);
  };

  const remove = async (id) => commit(records.current.filter((item) => item.id !== id));

  return { form, setField, allergies, ready, error, add, update, remove };
}
