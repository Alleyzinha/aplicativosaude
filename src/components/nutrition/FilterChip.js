import React from 'react';
import { Pressable, Text } from 'react-native';
export default function FilterChip({ label, selected, onPress, styles }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.filterChip, selected && styles.filterChipSelected]}><Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{label}</Text></Pressable>; }

