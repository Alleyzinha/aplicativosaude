import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './pressaoStyles';
import { classifyBloodPressure } from '../utils/bloodPressure';
import { formatBrazilDate } from '../utils/date';

export default function PressureReadingCard({ reading, onEdit, onDelete }) {
  const date = formatBrazilDate(reading.date);
  const classification = classifyBloodPressure(reading.systolic, reading.diastolic);

  return (
    <View style={styles.reading}>
      <View style={[styles.statusSide, { backgroundColor: classification.background }]}>
        <Ionicons
          name={classification.shortLabel === 'Normal' ? 'checkmark-circle' : 'alert-circle'}
          size={24}
          color={classification.color}
        />
      </View>
      <View style={styles.readingMain}>
        <Text style={styles.measure}>
          {reading.systolic}<Text style={styles.slash}> / </Text>{reading.diastolic}
          <Text style={styles.unit}> mmHg</Text>
        </Text>
        <Text style={[styles.statusText, { color: classification.color }]}>{classification.label}</Text>
        <Text style={styles.statusDescription}>{classification.description}</Text>
        <Text style={styles.muted}>
          {date} · {reading.time}
          {reading.arm ? ` · Braço ${reading.arm.toLowerCase()}` : ''}
          {reading.pulse ? ` · Pulso ${reading.pulse} bpm` : ''}
        </Text>
        {reading.note ? <Text style={styles.note}>{reading.note}</Text> : null}
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityLabel="Editar medida" onPress={onEdit} style={styles.iconButton}>
          <Ionicons name="create-outline" size={20} color="#C2185B" />
        </Pressable>
        <Pressable accessibilityLabel="Excluir medida" onPress={onDelete} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={20} color="#69717A" />
        </Pressable>
      </View>
    </View>
  );
}

