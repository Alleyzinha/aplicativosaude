import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { colors } from '../constants/theme';

export default function LabeledInput({ label, value, onChangeText, ...props }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textPlaceholder}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
});
