import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LabeledInput from '../LabeledInput';
import QuickAddButton from '../QuickAddButton';
import GradientButton from '../GradientButton';
import { QUICK_ADD_OPTIONS } from '../../constants/water';

export default function WaterIntakeForm({ addLog, customAmount, setCustomAmount, handleAddCustom }) {
  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Adicionar água</Text>

      <View style={styles.quickAddRow}>
        {QUICK_ADD_OPTIONS.map((option) => (
          <QuickAddButton
            key={option.id}
            label={option.label}
            onPress={() => addLog(option.amount)}
          />
        ))}
      </View>

      <View style={styles.customRow}>
        <View style={styles.customInputWrapper}>
          <LabeledInput
            label="Quantidade personalizada (ml)"
            placeholder="Ex: 250"
            value={customAmount}
            onChangeText={setCustomAmount}
          />
        </View>
        <GradientButton
          label="Adicionar"
          icon={<Ionicons name="add" size={18} color={colors.white} />}
          onPress={handleAddCustom}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 14,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 10,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  customInputWrapper: {
    flex: 1,
  },
});
