import React from 'react';
import { Pressable, Text } from 'react-native';
export default function TextButton({ label, onPress, styles }) { return <Pressable accessibilityRole="button" onPress={onPress} style={styles.textButton}><Text style={styles.textButtonLabel}>{label}</Text></Pressable>; }

