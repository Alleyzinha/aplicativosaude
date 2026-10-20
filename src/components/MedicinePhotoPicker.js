import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function MedicinePhotoPicker({ imageUri, onTakePhoto, onPickImage, onRemove }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Foto do remédio</Text>
      <Text style={styles.subtitle}>Fotografe a embalagem ou escolha uma imagem da galeria.</Text>

      <View style={styles.preview}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="medkit-outline" size={42} color={colors.medicine} />
            <Text style={styles.placeholderText}>Nenhuma imagem selecionada</Text>
          </View>
        )}

        {!!imageUri && (
          <Pressable
            accessibilityLabel="Remover foto"
            hitSlop={8}
            onPress={onRemove}
            style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={20} color={colors.white} />
          </Pressable>
        )}
      </View>

      <View style={styles.actions}>
        <PhotoAction icon="camera-outline" label="Tirar foto" onPress={onTakePhoto} primary />
        <PhotoAction icon="images-outline" label="Galeria" onPress={onPickImage} />
      </View>
    </View>
  );
}

function PhotoAction({ icon, label, onPress, primary = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        primary ? styles.primaryButton : styles.secondaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={19} color={primary ? colors.white : colors.medicine} />
      <Text style={primary ? styles.primaryText : styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  subtitle: { marginTop: 4, marginBottom: 14, fontSize: 12.5, lineHeight: 18, color: colors.textMuted },
  preview: { height: 190, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.medicineLight },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 9 },
  placeholderText: { fontSize: 12.5, fontWeight: '600', color: colors.textMuted },
  removeButton: {
    position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionButton: {
    flex: 1, minHeight: 46, borderRadius: 12, flexDirection: 'row', gap: 7,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  primaryButton: { backgroundColor: colors.medicine, borderColor: colors.medicine },
  secondaryButton: { backgroundColor: colors.surface, borderColor: colors.medicine },
  primaryText: { color: colors.white, fontSize: 13.5, fontWeight: '700' },
  secondaryText: { color: colors.medicine, fontSize: 13.5, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
