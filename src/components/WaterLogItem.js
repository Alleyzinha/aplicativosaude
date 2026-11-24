import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function WaterLogItem({ log, onDelete }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>
        <Ionicons name="water" size={18} color={colors.water} />
      </View>

      <Text style={styles.time}>{log.time}</Text>

      <Text style={styles.amount}>{log.amount}ml</Text>

      <Pressable
        style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
        onPress={() => onDelete(log.id)}
        hitSlop={8}
      >
        <Ionicons name="close" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.waterTrack,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  time: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  amount: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.waterDark,
    marginRight: 10,
  },
  deleteButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.6,
  },
});
