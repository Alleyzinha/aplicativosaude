import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LabeledInput from '../LabeledInput';
import GradientButton from '../GradientButton';

export default function BmiForm({ weight, setWeight, height, setHeight, error, handleClear, handleCalculate }) {
  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Seus dados</Text>

      <View style={styles.inputsRow}>
        <View style={styles.inputGroup}>
          <LabeledInput
            label="Peso (kg)"
            placeholder="Ex: 70"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <LabeledInput
            label="Altura (cm)"
            placeholder="Ex: 170"
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.buttonsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleClear}
        >
          <Text style={styles.clearButtonText}>Limpar</Text>
        </Pressable>

        <GradientButton
          label="Calcular IMC"
          icon={<Ionicons name="calculator-outline" size={18} color="#FFFFFF" />}
          onPress={handleCalculate}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#EEF1F6',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  errorText: {
    color: '#E53935',
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  clearButton: {
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  clearButtonText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 14,
  },
});
