import React from 'react';
import { StyleSheet, Text, View, Pressable, Platform, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useProfile } from '../context/ProfileContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../constants/theme';

export default function Header({ title, subtitle, onBack }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useProfile();
  return (
    <LinearGradient {...gradients.header} style={styles.header}>
      <View style={onBack ? styles.headerRow : styles.headerTop}>
        {onBack && (
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={onBack}
          >
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </Pressable>
        )}
        <Text style={styles.title}>{title}</Text>
        {route.name !== 'Perfil' && (
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir meu perfil" onPress={() => navigation.navigate('Perfil')} style={styles.profileButton}>
            {profile.photo ? <Image source={{ uri: profile.photo }} style={styles.avatar} /> : <Ionicons name="person-circle-outline" size={32} color={colors.white} />}
          </Pressable>
        )}
      </View>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  profileButton: { marginLeft: 'auto', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  pressed: { opacity: 0.7 },
});
