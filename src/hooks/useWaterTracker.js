import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '../context/ProfileContext';
import { DEFAULT_GOAL_ML } from '../constants/water';
import { calculateDailyWaterGoal, formatTime, sumLogs } from '../utils/water';
import { todayBrazil } from '../utils/date';

const STORAGE_KEY = '@saude/water/v1';

export default function useWaterTracker() {
  const { updateProfile } = useProfile();
  const [goal, setGoal] = useState(DEFAULT_GOAL_ML);
  const [logs, setLogs] = useState([]);
  const [customAmount, setCustomAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(DEFAULT_GOAL_ML));
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [calculationError, setCalculationError] = useState('');
  const [calculatedProfile, setCalculatedProfile] = useState(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (!active || !saved) return;
      const parsed = JSON.parse(saved);
      if (parsed.date === todayBrazil() && Array.isArray(parsed.logs)) setLogs(parsed.logs);
      if (Number.isFinite(parsed.goal) && parsed.goal > 0) {
        setGoal(parsed.goal);
        setGoalInput(String(parsed.goal));
      }
    }).catch(() => {}).finally(() => { if (active) setStorageReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (storageReady) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayBrazil(), logs, goal })).catch(() => {});
  }, [logs, goal, storageReady]);

  const current = sumLogs(logs);

  const addLog = (amount) => {
    if (!amount || amount <= 0) return;
    const newLog = {
      id: String(Date.now()),
      amount,
      time: formatTime(new Date()),
      date: todayBrazil(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleAddCustom = () => {
    const amount = parseInt(customAmount.replace(',', '.'), 10);
    addLog(amount);
    setCustomAmount('');
  };

  const handleDeleteLog = (id) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleClearDay = () => {
    setLogs([]);
  };

  const handleConfirmGoal = () => {
    const value = parseInt(goalInput.replace(',', '.'), 10);
    if (value && value > 0) {
      setGoal(value);
    } else {
      setGoalInput(String(goal));
    }
    setEditingGoal(false);
  };

  const handleCalculateGoal = () => {
    const weightKg = parseFloat(weight.replace(',', '.'));
    const heightCm = parseFloat(height.replace(',', '.'));

    if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm <= 0) {
      setCalculationError('Preencha peso e altura corretamente.');
      return;
    }

    const calculatedGoal = calculateDailyWaterGoal(weightKg);

    setGoal(calculatedGoal);
    setGoalInput(String(calculatedGoal));
    setEditingGoal(false);
    setCalculationError('');
    setCalculatedProfile({ weightKg, heightCm, goal: calculatedGoal });
    updateProfile({ weight: weightKg, height: heightCm });
  };

  return {
    goal,
    logs,
    customAmount,
    setCustomAmount,
    editingGoal,
    setEditingGoal,
    goalInput,
    setGoalInput,
    weight,
    setWeight,
    height,
    setHeight,
    calculationError,
    calculatedProfile,
    current,
    addLog,
    handleAddCustom,
    handleDeleteLog,
    handleClearDay,
    handleConfirmGoal,
    handleCalculateGoal,
  };
}
