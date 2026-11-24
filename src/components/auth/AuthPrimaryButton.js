import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { authStyles as styles } from './authStyles';
export default function AuthPrimaryButton({ label, onPress, disabled = false, loading = false }) {
 return <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, (disabled || loading) && styles.disabled]}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{label}</Text>}</Pressable>;
}

