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
      <Header title="Meus remédios" subtitle="Cadastre e identifique seus medicamentos por foto" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <MedicinePhotoPicker
            imageUri={imageUri}
            onTakePhoto={handleTakePhoto}
            onPickImage={handlePickImage}
            onRemove={() => setImageUri(null)}
          />
          <MedicineForm values={form} error={error} onChange={handleChange} onSubmit={handleAdd} />

          <View style={styles.listCard}>
            <Text style={styles.listTitle}>Remédios cadastrados</Text>
            {medicines.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum remédio cadastrado ainda.</Text>
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
  listCard: {
    marginTop: 16, padding: 18, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  listTitle: { marginBottom: 4, fontSize: 15, fontWeight: '800', color: colors.textDark },
  emptyText: { marginTop: 10, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  note: { marginTop: 16, paddingHorizontal: 16, textAlign: 'center', fontSize: 11.5, lineHeight: 16, color: colors.textPlaceholder },
});
