import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authStyles as styles } from './authStyles';

export default function AuthTextField({ label, value, onChangeText, placeholder, keyboardType = 'default', autoCapitalize = 'none', secure = false, autoComplete }) {
  const [showPassword, setShowPassword] = useState(false);
  const passwordField = secure;
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrap}>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#94A3B8" keyboardType={keyboardType} autoCapitalize={autoCapitalize} autoComplete={autoComplete} secureTextEntry={passwordField && !showPassword} style={styles.input} />
      {passwordField ? <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setShowPassword((visible) => !visible)} style={styles.visibility}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color="#64748B" /></Pressable> : null}
    </View>
  </View>;
}

