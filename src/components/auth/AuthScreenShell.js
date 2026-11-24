import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authStyles as styles } from './authStyles';

export default function AuthScreenShell({ title, subtitle, children, footer, onBack }) {
  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        {onBack ? <Pressable onPress={onBack} accessibilityRole="button" style={styles.back}><Ionicons name="arrow-back" size={19} color="#1E3A8A" /><Text style={styles.backText}>Voltar</Text></Pressable> : null}
        <View style={styles.brandMark}><Ionicons name="heart" size={26} color="#fff" /></View>
        <Text style={styles.brand}>Saúde & Bem-Estar</Text>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
          {footer}
        </View>
        <Text style={styles.demoNote}>Demonstração acadêmica · sem armazenamento de conta</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

