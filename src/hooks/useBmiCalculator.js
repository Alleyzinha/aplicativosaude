import { useState } from 'react';
import { getCategory } from '../utils/imc';
import { useProfile } from '../context/ProfileContext';

export default function useBmiCalculator() {
  const { updateProfile } = useProfile();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [error, setError] = useState('');

  const activeCategory = bmi ? getCategory(bmi) : null;

  const handleCalculate = () => {
    const w = parseFloat(weight.replace(',', '.'));
    const hCm = parseFloat(height.replace(',', '.'));

    if (!Number.isFinite(w) || !Number.isFinite(hCm) || w <= 0 || hCm <= 0) {
      setError('Preencha peso e altura corretamente.');
      setBmi(null);
      return;
    }

    const h = hCm / 100;
    const result = w / (h * h);
    setBmi(result);
    updateProfile({ weight: w, height: hCm });
    setError('');
  };

  const handleClear = () => {
    setWeight('');
    setHeight('');
    setBmi(null);
    setError('');
  };

  return {
    weight,
    setWeight,
    height,
    setHeight,
    bmi,
    error,
    activeCategory,
    handleCalculate,
    handleClear,
  };
}
