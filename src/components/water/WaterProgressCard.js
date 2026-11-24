import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import LabeledInput from '../LabeledInput';
import WaterRing from '../WaterRing';

export default function WaterProgressCard({ current, goal, editingGoal, goalInput, setGoalInput, setEditingGoal, handleConfirmGoal }) {
  return (
    <View style={styles.gaugeCard}>
      <WaterRing current={current} goal={goal} />

      {editingGoal ? (
        <View style={styles.goalEditRow}>
          <View style={styles.goalInputWrapper}>
            <LabeledInput
              label="Nova meta (ml)"
              placeholder="Ex: 1200"
              value={goalInput}
              onChangeText={setGoalInput}
            />
          </View>
          <Pressable
            style={({ pressed }) => [styles.goalConfirmButton, pressed && styles.pressed]}
            onPress={handleConfirmGoal}
          >
            <Ionicons name="checkmark" size={20} color={colors.white} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.editGoalButton, pressed && styles.pressed]}
          onPress={() => {
            setGoalInput(String(goal));
            setEditingGoal(true);
          }}
        >
          <Ionicons name="pencil" size={13} color={colors.waterDark} />
          <Text style={styles.editGoalText}>Editar meta</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gaugeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  goalEditRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 14,
    width: '100%',
  },
  goalInputWrapper: {
    flex: 1,
  },
  goalConfirmButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.water,
  },
  pressed: {
    opacity: 0.75,
  },
  editGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.waterTrack,
  },
  editGoalText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.waterDark,
  },
});
