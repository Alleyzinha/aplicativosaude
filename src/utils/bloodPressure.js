export function classifyBloodPressure(systolic, diastolic) {
  const sys = Number(systolic);
  const dia = Number(diastolic);

  if (sys >= 180 || dia >= 120) {
    return { label: 'Crise hipertensiva', shortLabel: 'Crise', color: '#B42318', background: '#FEE4E2', description: 'Procure atendimento urgente se houver sintomas.' };
  }
  if (sys >= 140 || dia >= 90) {
    return { label: 'Hipertensão estágio 2', shortLabel: 'Estágio 2', color: '#C62828', background: '#FDECEC', description: 'Valor elevado. Consulte um profissional de saúde.' };
  }
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
    return { label: 'Hipertensão estágio 1', shortLabel: 'Estágio 1', color: '#D97706', background: '#FEF3C7', description: 'Acompanhe as medidas e procure orientação.' };
  }
  if (sys >= 120 && sys <= 129 && dia < 80) {
    return { label: 'Pressão elevada', shortLabel: 'Elevada', color: '#E65100', background: '#FFF3E0', description: 'Valor acima do ideal. Acompanhe regularmente.' };
  }
  if (sys < 90 || dia < 60) {
    return { label: 'Pressão baixa', shortLabel: 'Baixa', color: '#1976D2', background: '#E3F2FD', description: 'Tontura ou mal-estar? Procure orientação.' };
  }
  return { label: 'Pressão normal', shortLabel: 'Normal', color: '#2E7D32', background: '#E8F5E9', description: 'Dentro da faixa considerada normal.' };
}
