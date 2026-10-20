import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function MedicineListItem({ medicine, onDelete }) {
  return (
    <View style={styles.container}>
      {medicine.imageUri ? (
        <Image source={{ uri: medicine.imageUri }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.fallback]}>
          <Ionicons name="medical-outline" size={22} color={colors.medicine} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{medicine.name}</Text>
        <Text style={styles.details}>{[medicine.dosage, medicine.time].filter(Boolean).join(' • ') || 'Sem detalhes adicionais'}</Text>
      </View>
      <Pressable
        accessibilityLabel={`Excluir ${medicine.name}`}
        hitSlop={8}
        onPress={() => onDelete(medicine.id)}
        style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
      >
        <Ionicons name="trash-outline" size={19} color={colors.error} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.border },
  thumbnail: { width: 52, height: 52, borderRadius: 13 },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.medicineLight },
  content: { flex: 1, marginHorizontal: 11 },
  name: { fontSize: 14, fontWeight: '800', color: colors.textDark },
  details: { marginTop: 4, fontSize: 12.5, color: colors.textMuted },
  deleteButton: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2' },
  pressed: { opacity: 0.65 },
});
