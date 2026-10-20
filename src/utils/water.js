export function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function sumLogs(logs) {
  return logs.reduce((total, log) => total + log.amount, 0);
}

export function getProgress(current, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(current / goal, 1);
}

// Referência geral de hidratação para adultos: 35 ml por kg de peso ao dia.
export function calculateDailyWaterGoal(weightKg) {
  return Math.round(weightKg * 35);
}
