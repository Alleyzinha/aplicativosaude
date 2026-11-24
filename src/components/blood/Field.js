import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { colors } from '../../constants/theme';
export default function Field({ label, value, onChangeText, placeholder, maxLength, multiline = false, styles }) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textPlaceholder} maxLength={maxLength} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, multiline && styles.multilineInput]} /></View>; }

