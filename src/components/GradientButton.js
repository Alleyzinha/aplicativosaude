import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../constants/theme';

export default function GradientButton({ label, icon, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
      onPress={onPress}
    >
      <LinearGradient {...gradients.button} style={styles.button}>
        {icon}
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 8,
  },
  text: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
