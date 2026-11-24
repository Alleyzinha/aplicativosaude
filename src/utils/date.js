export function todayBrazil() {
  const date = new Date();
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

export function isValidBrazilDate(value) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function toISODate(value) {
  if (!isValidBrazilDate(value)) return '';
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

export function fromISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return value || '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function formatBrazilDate(value) {
  if (!value) return '';
  const brazil = /^\d{2}\/\d{2}\/\d{4}$/.test(value);
  if (brazil) return isValidBrazilDate(value) ? value : '';
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (iso) return fromISODate(value);
  return value;
}
