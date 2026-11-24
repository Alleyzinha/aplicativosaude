import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export default function useGlucose() {
  const [readings, setReadings] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await apiRequest('/api/glucose');
      setReadings(Array.isArray(data.readings) ? data.readings : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (reading) => {
    try {
      const data = await apiRequest('/api/glucose', { method: 'POST', body: JSON.stringify(reading) });
      setReadings((current) => [data.reading, ...current].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)));
      return true;
    } catch (requestError) { setError(requestError.message); return false; }
  }, []);

  const update = useCallback(async (id, reading) => {
    try {
      const data = await apiRequest(`/api/glucose/${id}`, { method: 'PUT', body: JSON.stringify(reading) });
      setReadings((current) => current.map((item) => item.id === data.reading.id ? data.reading : item).sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)));
      return true;
    } catch (requestError) { setError(requestError.message); return false; }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await apiRequest(`/api/glucose/${id}`, { method: 'DELETE' });
      setReadings((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (requestError) { setError(requestError.message); return false; }
  }, []);

  return { readings, ready, error, load, add, update, remove };
}
