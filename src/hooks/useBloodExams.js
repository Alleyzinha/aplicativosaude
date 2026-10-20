import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saude/blood-exams/v1';

function normalizeExam(exam) {
  if (!exam || typeof exam !== 'object' || !exam.id || !exam.name || !exam.result) return null;
  return {
    id: String(exam.id),
    name: String(exam.name),
    date: typeof exam.date === 'string' ? exam.date : '',
    result: String(exam.result),
    unit: typeof exam.unit === 'string' ? exam.unit : '',
    referenceRange: typeof exam.referenceRange === 'string' ? exam.referenceRange : '',
    note: typeof exam.note === 'string' ? exam.note : '',
  };
}

function sortExams(records) {
  return [...records].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export default function useBloodExams() {
  const [exams, setExams] = useState([]);
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
        if (!Array.isArray(parsed)) throw new Error('Invalid exam list');
        const loaded = sortExams(parsed.map(normalizeExam).filter(Boolean));
        records.current = loaded;
        setExams(loaded);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os exames salvos neste aparelho.');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => { active = false; };
  }, []);

  const commit = useCallback((nextRecords) => {
    const sorted = sortExams(nextRecords);
    records.current = sorted;
    setExams(sorted);
    setError('');
    writes.current = writes.current.catch(() => {}).then(() =>
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
    );
    return writes.current.then(() => {
      setError('');
      return true;
    }).catch(() => {
      setError('Não foi possível salvar as alterações neste aparelho. Tente novamente.');
      return false;
    });
  }, []);

  const addExam = useCallback((exam) => {
    const next = normalizeExam({ ...exam, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
    if (!next) return Promise.resolve(false);
    return commit([...records.current, next]);
  }, [commit]);

  const updateExam = useCallback((id, changes) => {
    const next = records.current.map((exam) => exam.id === id ? normalizeExam({ ...exam, ...changes, id }) : exam).filter(Boolean);
    return commit(next);
  }, [commit]);

  const deleteExam = useCallback((id) => {
    return commit(records.current.filter((exam) => exam.id !== id));
  }, [commit]);

  return { exams, ready, error, addExam, updateExam, deleteExam };
}
