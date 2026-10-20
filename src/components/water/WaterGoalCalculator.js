import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LabeledInput from '../LabeledInput';

export default function WaterGoalCalculator({ weight, setWeight, height, setHeight, calculationError, calculatedProfile, handleCalculateGoal }) {
  return (
    <View style={styles.calculatorCard}>
      <View style={styles.calculatorHeading}>
        <View style={styles.calculatorIcon}>
          <Ionicons name="body-outline" size={20} color={colors.waterDark} />
        </View>
        <View style={styles.calculatorTextGroup}>
          <Text style={styles.formTitle}>Calcule sua meta diária</Text>
          <Text style={styles.calculatorSubtitle}>
            Informe seus dados para personalizar a quantidade de água.
          </Text>
        </View>
      </View>

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

      {!!calculationError && (
        <Text style={styles.errorText}>{calculationError}</Text>
      )}

      {!!calculatedProfile && (
        <Text style={styles.calculationResult}>
          Para {calculatedProfile.weightKg} kg e {calculatedProfile.heightCm} cm, sua meta estimada é de{' '}
          {calculatedProfile.goal} ml por dia.
        </Text>
      )}

      <View style={styles.calculatorFooter}>
        <Text style={styles.calculationNote}>Referência: 35 ml por kg/dia.</Text>
        <Pressable
          style={({ pressed }) => [styles.calculateButton, pressed && styles.pressed]}
          onPress={handleCalculateGoal}
        >
          <Ionicons name="calculator-outline" size={17} color={colors.white} />
          <Text style={styles.calculateButtonText}>Calcular meta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calculatorCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  calculatorHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calculatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.waterTrack,
    marginRight: 10,
  },
  calculatorTextGroup: {
    flex: 1,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 14,
  },
  calculatorSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 10,
  },
  calculationResult: {
    color: colors.waterDark,
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 10,
  },
  calculatorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  calculationNote: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textMuted,
    lineHeight: 16,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.water,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  pressed: {
    opacity: 0.75,
  },
  calculateButtonText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
});
