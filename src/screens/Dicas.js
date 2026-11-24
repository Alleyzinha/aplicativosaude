import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

const filters = ['Todas', 'Alimentação', 'Movimento', 'Bem-estar', 'Prevenção'];
const tips = [
  { id: '1', category: 'Alimentação', icon: 'water-outline', color: '#168C88', title: 'Água por perto', text: 'Deixe uma garrafa visível e beba ao longo do dia.' },
  { id: '2', category: 'Alimentação', icon: 'restaurant-outline', color: '#D68135', title: 'Monte um prato colorido', text: 'Varie legumes e verduras nas refeições.' },
  { id: '3', category: 'Alimentação', icon: 'leaf-outline', color: '#4D9A60', title: 'Prefira comida de verdade', text: 'Inclua alimentos frescos sempre que puder.' },
  { id: '4', category: 'Alimentação', icon: 'time-outline', color: '#6E7FC4', title: 'Coma com calma', text: 'Uma pausa ajuda a perceber a saciedade.' },
  { id: '5', category: 'Movimento', icon: 'walk-outline', color: '#278C78', title: 'Faça pequenas caminhadas', text: 'Alguns minutos de movimento já contam.' },
  { id: '6', category: 'Movimento', icon: 'body-outline', color: '#D47744', title: 'Alongue-se nas pausas', text: 'Levante e mude de posição durante o dia.' },
  { id: '7', category: 'Movimento', icon: 'fitness-outline', color: '#7A62B3', title: 'Escolha algo prazeroso', text: 'Dançar, pedalar ou caminhar: vale o que funciona.' },
  { id: '8', category: 'Bem-estar', icon: 'moon-outline', color: '#5667A5', title: 'Crie um ritual de sono', text: 'Tente manter horários parecidos para dormir.' },
  { id: '9', category: 'Bem-estar', icon: 'phone-portrait-outline', color: '#B56E55', title: 'Desacelere à noite', text: 'Reduza telas e luz forte antes de deitar.' },
  { id: '10', category: 'Bem-estar', icon: 'happy-outline', color: '#D39A35', title: 'Reserve um tempo para você', text: 'Uma pausa curta também faz diferença.' },
  { id: '11', category: 'Bem-estar', icon: 'heart-outline', color: '#D45F78', title: 'Cuide das suas conexões', text: 'Converse com alguém de confiança.' },
  { id: '12', category: 'Prevenção', icon: 'calendar-outline', color: '#4382A7', title: 'Acompanhe consultas', text: 'Anote dúvidas e leve seus registros.' },
  { id: '13', category: 'Prevenção', icon: 'medkit-outline', color: '#C95757', title: 'Use medicamentos como prescritos', text: 'Em caso de dúvida, fale com um profissional.' },
  { id: '14', category: 'Prevenção', icon: 'hand-left-outline', color: '#598C73', title: 'Lave as mãos', text: 'Água e sabão ajudam a reduzir a transmissão de germes.' },
  { id: '15', category: 'Prevenção', icon: 'shield-checkmark-outline', color: '#5B73B4', title: 'Revise suas vacinas', text: 'Confira a carteira com a equipe de saúde.' },
];

export default function DicasScreen({ navigation }) {
  const [active, setActive] = useState('Todas');
  const visibleTips = useMemo(() => active === 'Todas' ? tips : tips.filter((tip) => tip.category === active), [active]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2B46" />
      <Header title="Dicas de saúde" subtitle="Ideias simples para cuidar de você no dia a dia" onBack={() => navigation.goBack()} />
      <View style={styles.filtersWrap}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => (
            <Pressable onPress={() => setActive(item)} style={[styles.filter, active === item && styles.filterActive]}>
              <Text style={[styles.filterText, active === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          )}
        />
      </View>
      <FlatList
        key={active}
        data={visibleTips}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.count}>{visibleTips.length} dicas para experimentar</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: `${item.color}18` }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.text}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F8' },
  filtersWrap: { paddingTop: 14 },
  filters: { paddingHorizontal: 16, gap: 8 },
  filter: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E9EC' },
  filterActive: { backgroundColor: '#168C88', borderColor: '#168C88' },
  filterText: { fontSize: 12, fontWeight: '700', color: '#5D6972' },
  filterTextActive: { color: '#FFFFFF' },
  grid: { padding: 16, paddingTop: 10, paddingBottom: 28 },
  count: { color: '#64727B', fontSize: 12, fontWeight: '600', marginBottom: 10 },
  row: { gap: 10, marginBottom: 10 },
  card: { flex: 1, minHeight: 157, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 13, borderWidth: 1, borderColor: '#E9EEF0' },
  iconBox: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  category: { color: '#839098', fontSize: 10, fontWeight: '700', marginBottom: 3 },
  title: { color: '#20323B', fontSize: 13, fontWeight: '800', lineHeight: 17, marginBottom: 5 },
  description: { color: '#62717A', fontSize: 11, lineHeight: 15 },
});
