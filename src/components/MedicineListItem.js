import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function MedicineListItem({ medicine, onDelete }) {
  const schedule = [medicine.dosage, medicine.frequency, medicine.time]
    .filter(Boolean)
    .join(' • ');

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
        <View style={styles.nameRow}>
          <Text style={styles.name}>{medicine.name}</Text>
          {!!medicine.route && (
            <View style={styles.routeBadge}>
              <Text style={styles.routeText}>{medicine.route}</Text>
            </View>
          )}
        </View>
        <Text style={styles.details}>{schedule || 'Sem detalhes adicionais'}</Text>
        {!!medicine.instructions && (
          <Text style={styles.instructions} numberOfLines={2}>{medicine.instructions}</Text>
        )}
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
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  thumbnail: { width: 52, height: 52, borderRadius: 13 },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.medicineLight },
  content: { flex: 1, marginHorizontal: 11 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  name: { fontSize: 14, fontWeight: '800', color: colors.textDark },
  routeBadge: { borderRadius: 8, backgroundColor: colors.medicineLight, paddingHorizontal: 7, paddingVertical: 3 },
  routeText: { fontSize: 10.5, fontWeight: '800', color: colors.medicine },
  details: { marginTop: 4, fontSize: 12.5, color: colors.textMuted },
  instructions: { marginTop: 4, fontSize: 11.5, lineHeight: 15, color: colors.textPlaceholder },
  deleteButton: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2' },
  pressed: { opacity: 0.65 },
});
