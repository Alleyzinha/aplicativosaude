export const colors = {
  primaryDark: '#0F2B46',
  primary: '#1E3A8A',
  primaryLight: '#2563EB',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  border: '#EEF1F6',
  textDark: '#1E293B',
  textMedium: '#334155',
  textMuted: '#64748B',
  textPlaceholder: '#94A3B8',
  inputBorder: '#E2E8F0',
  error: '#E53935',
  white: '#FFFFFF',

  water: '#29B6F6',
  waterDark: '#0288D1',
  waterTrack: '#E1F5FE',
  medicine: '#8E24AA',
  medicineLight: '#F3E5F5',
};

export const gradients = {
  header: {
    colors: [colors.primaryDark, colors.primary, colors.primaryLight],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  button: {
    colors: [colors.primary, colors.primaryLight],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  water: {
    colors: [colors.waterDark, colors.water],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};
