import React from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';
export default function ActionButton({ icon, label, onPress, disabled = false, styles }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, pressed && !disabled && styles.pressed, disabled && styles.disabled]}><Ionicons name={icon} size={19} color={colors.white} /><Text style={styles.buttonText}>{label}</Text></Pressable>; }

