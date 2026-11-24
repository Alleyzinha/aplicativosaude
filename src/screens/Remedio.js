import useMedicines from '../hooks/useMedicines';
import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import MedicinePhotoPicker from '../components/MedicinePhotoPicker';
import MedicineForm from '../components/MedicineForm';
import MedicineListItem from '../components/MedicineListItem';
import { colors } from '../constants/theme';

export default function RemedioScreen({ navigation }) {
  const {
    imageUri,
    setImageUri,
    form,
    error,
    medicines,
    handleTakePhoto,
    handlePickImage,
    handleChange,
    handleAdd,
    handleDelete,
  } = useMedicines();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <Header title="Medicação" subtitle="Organize horários, dosagens e forma de uso" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>Medicamentos cadastrados</Text>
              <Text style={styles.summaryValue}>{medicines.length}</Text>
            </View>
            <View style={styles.summaryIcon}><Text style={styles.summaryIconText}>Rx</Text></View>
          </View>

          <MedicinePhotoPicker
            imageUri={imageUri}
            onTakePhoto={handleTakePhoto}
            onPickImage={handlePickImage}
            onRemove={() => setImageUri(null)}
          />
          <MedicineForm values={form} error={error} onChange={handleChange} onSubmit={handleAdd} />

          <View style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Minha medicação</Text>
              <Text style={styles.listCount}>{medicines.length} itens</Text>
            </View>
            {medicines.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nenhum medicamento ainda</Text>
                <Text style={styles.emptyText}>Preencha os dados acima para montar sua rotina.</Text>
              </View>
            ) : (
              medicines.map((medicine) => (
                <MedicineListItem key={medicine.id} medicine={medicine} onDelete={handleDelete} />
              ))
            )}
          </View>
          <Text style={styles.note}>Use os dados da receita ou da embalagem. Em caso de dúvida, consulte um profissional de saúde.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
  summaryCard: {
    minHeight: 84, marginBottom: 16, paddingHorizontal: 18, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.medicineLight, borderWidth: 1, borderColor: '#E9D5F0',
  },
  summaryLabel: { fontSize: 12, fontWeight: '700', color: colors.medicine },
  summaryValue: { marginTop: 3, fontSize: 30, lineHeight: 34, fontWeight: '900', color: colors.textDark },
  summaryIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.medicine },
  summaryIconText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  listCard: {
    marginTop: 16, padding: 18, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  listHeader: { marginBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listTitle: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  listCount: { fontSize: 11.5, fontWeight: '700', color: colors.textPlaceholder },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { fontSize: 13.5, fontWeight: '800', color: colors.textMedium },
  emptyText: { marginTop: 5, fontSize: 12.5, textAlign: 'center', color: colors.textMuted },
  note: { marginTop: 16, paddingHorizontal: 16, textAlign: 'center', fontSize: 11.5, lineHeight: 16, color: colors.textPlaceholder },
});
