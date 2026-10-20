import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import NutritionValue from '../components/nutrition/NutritionValue';
import FilterChip from '../components/nutrition/FilterChip';
import useNutritionData, { getLocalDate } from '../hooks/useNutritionData';
import { colors } from '../constants/theme';

const FRUIT_LABELS = {
  apple: 'Maçã', 'green apple': 'Maçã verde', apricot: 'Damasco', avocado: 'Abacate', banana: 'Banana',
  blackberry: 'Amora-preta', blueberry: 'Mirtilo', cherry: 'Cereja', cranberry: 'Oxicoco', durian: 'Durião',
  fig: 'Figo', gooseberry: 'Groselha', grapes: 'Uva', guava: 'Goiaba', kiwi: 'Kiwi', lemon: 'Limão',
  lime: 'Lima', lingonberry: 'Airela', lychee: 'Lichia', mango: 'Manga', melon: 'Melão', watermelon: 'Melancia',
  orange: 'Laranja', papaya: 'Mamão', passionfruit: 'Maracujá', peach: 'Pêssego', pear: 'Pera', persimmon: 'Caqui',
  pineapple: 'Abacaxi', plum: 'Ameixa', pomegranate: 'Romã', raspberry: 'Framboesa', strawberry: 'Morango',
  tomato: 'Tomate', pomelo: 'Pomelo', dragonfruit: 'Pitaya', pitahaya: 'Pitaya', feijoa: 'Feijoa',
};

function fruitLabel(name) {
  return FRUIT_LABELS[name.trim().toLowerCase()] || name;
}

function normalizeSearch(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

function previousDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getLocalDate(date);
}

function dayLabel(date) {
  if (date === getLocalDate()) return 'Hoje';
  if (date === previousDate(1)) return 'Ontem';
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatNumber(value, digits = 1) {
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

export default function AlimentacaoScreen({ navigation }) {
  const {
    catalog, favorites, entries, ready, apiLoading, apiError, storageError, updatedAt,
    toggleFavorite, addEntry, removeEntry, retry,
  } = useNutritionData();
  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [grams, setGrams] = useState('100');
  const [showAllFruits, setShowAllFruits] = useState(false);
  const [message, setMessage] = useState('');

  const dateOptions = useMemo(() => Array.from({ length: 7 }, (_, index) => previousDate(6 - index)), []);
  const dayEntries = useMemo(() => entries.filter((entry) => entry.date === selectedDate), [entries, selectedDate]);
  const totals = useMemo(() => dayEntries.reduce((sum, entry) => {
    for (const key of ['calories', 'carbohydrates', 'protein', 'fat', 'sugar']) sum[key] += entry.nutritions[key] || 0;
    return sum;
  }, { calories: 0, carbohydrates: 0, protein: 0, fat: 0, sugar: 0 }), [dayEntries]);

  const filteredFruits = useMemo(() => {
    const query = normalizeSearch(search);
    return [...catalog]
      .filter((fruit) => !favoritesOnly || favorites.includes(fruit.id))
      .filter((fruit) => !query || normalizeSearch(`${fruit.name} ${fruitLabel(fruit.name)} ${fruit.family} ${fruit.genus}`).includes(query))
      .sort((a, b) => {
        const favoriteOrder = Number(favorites.includes(b.id)) - Number(favorites.includes(a.id));
        return favoriteOrder || fruitLabel(a.name).localeCompare(fruitLabel(b.name), 'pt-BR');
      });
  }, [catalog, favorites, favoritesOnly, search]);
  const visibleFruits = showAllFruits ? filteredFruits : filteredFruits.slice(0, 18);

  const openFruit = (fruit) => {
    setSelectedFruit(fruit);
    setGrams('100');
    setMessage('');
  };

  const addSelectedFruit = () => {
    const amount = Number(grams.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) {
      setMessage('Informe uma quantidade entre 1 e 5.000 gramas.');
      return;
    }
    const added = addEntry({ fruit: selectedFruit, grams: Math.round(amount * 10) / 10, date: selectedDate });
    if (!added) {
      setMessage('Não foi possível adicionar este alimento. Atualize a lista e tente novamente.');
      return;
    }
    setMessage(`${fruitLabel(selectedFruit.name)} adicionado ao diário.`);
    setSelectedFruit(null);
  };

  const openFruityvice = async () => {
    try {
      await Linking.openURL('https://www.fruityvice.com');
    } catch {
      setMessage('Não foi possível abrir o site Fruityvice.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#175D32" />
      <Header title="Alimentação" subtitle="Explore frutas e organize o que consumiu" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Ionicons name="nutrition-outline" size={30} color="#2E7D32" /></View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Seu diário de frutas</Text>
            <Text style={styles.heroBody}>Consulte dados nutricionais e acompanhe os alimentos registrados no dia.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeadingRow}>
            <View>
              <Text style={styles.sectionTitle}>Resumo do dia</Text>
              <Text style={styles.muted}>{dayLabel(selectedDate)}</Text>
            </View>
            <View style={styles.calorieBadge}>
              <Text style={styles.calorieValue}>{formatNumber(totals.calories, 0)}</Text>
              <Text style={styles.calorieLabel}>kcal estimadas</Text>
            </View>
          </View>
          <View style={styles.macroRow}>
            <NutritionValue styles={styles} formatNumber={formatNumber} label="Carboidratos" value={totals.carbohydrates} />
            <NutritionValue styles={styles} formatNumber={formatNumber} label="Proteína" value={totals.protein} />
            <NutritionValue styles={styles} formatNumber={formatNumber} label="Gordura" value={totals.fat} />
            <NutritionValue styles={styles} formatNumber={formatNumber} label="Açúcares" value={totals.sugar} />
          </View>
          <Text style={styles.smallNote}>Estimativas calculadas a partir dos itens registrados. Não representam uma meta ou recomendação alimentar.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeadingRow}>
            <Text style={styles.sectionTitle}>Diário alimentar</Text>
            <Text style={styles.muted}>{dayEntries.length} {dayEntries.length === 1 ? 'item' : 'itens'}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateTabs}>
            {dateOptions.map((date) => (
              <Pressable key={date} accessibilityRole="button" accessibilityState={{ selected: selectedDate === date }} onPress={() => setSelectedDate(date)} style={[styles.dateTab, selectedDate === date && styles.dateTabSelected]}>
                <Text style={[styles.dateTabText, selectedDate === date && styles.dateTabTextSelected]}>{dayLabel(date)}</Text>
              </Pressable>
            ))}
          </ScrollView>
          {dayEntries.length ? dayEntries.map((entry) => (
            <View key={entry.id} style={styles.logItem}>
              <View style={styles.fruitDot}><Ionicons name="leaf" size={18} color="#2E7D32" /></View>
              <View style={styles.logInfo}>
                <Text style={styles.logTitle}>{fruitLabel(entry.name)}</Text>
                <Text style={styles.muted}>{formatNumber(entry.grams)} g · {formatNumber(entry.nutritions.calories, 0)} kcal</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${fruitLabel(entry.name)} do diário`} onPress={() => removeEntry(entry.id)} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={19} color="#B42318" />
              </Pressable>
            </View>
          )) : (
            <View style={styles.emptyState}>
              <Ionicons name="journal-outline" size={27} color="#7A8A7C" />
              <Text style={styles.muted}>Nenhum alimento registrado neste dia.</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeadingRow}>
            <View style={styles.headingText}>
              <Text style={styles.sectionTitle}>Frutas e informações nutricionais</Text>
              <Text style={styles.muted}>{catalog.length ? `${filteredFruits.length} frutas disponíveis` : 'Base Fruityvice'}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Atualizar frutas" disabled={apiLoading} onPress={retry} style={styles.refreshButton}>
              {apiLoading ? <ActivityIndicator size="small" color="#2E7D32" /> : <Ionicons name="refresh-outline" size={20} color="#2E7D32" />}
            </Pressable>
          </View>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={20} color="#758477" />
            <TextInput accessibilityLabel="Buscar frutas" value={search} onChangeText={(value) => { setSearch(value); setShowAllFruits(false); }} placeholder="Buscar por fruta, família ou gênero" placeholderTextColor="#87958A" style={styles.searchInput} returnKeyType="search" />
            {search ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => setSearch('')}><Ionicons name="close-circle" size={19} color="#758477" /></Pressable> : null}
          </View>
          <View style={styles.filters}>
            <FilterChip styles={styles} label="Todas" selected={!favoritesOnly} onPress={() => { setFavoritesOnly(false); setShowAllFruits(false); }} />
            <FilterChip styles={styles} label={`Favoritas (${favorites.length})`} selected={favoritesOnly} onPress={() => { setFavoritesOnly((value) => !value); setShowAllFruits(false); }} />
          </View>
          {apiError ? (
            <View style={styles.apiMessage}>
              <Ionicons name="cloud-offline-outline" size={20} color="#9A3412" />
              <Text style={styles.apiMessageText}>{apiError}</Text>
              <Pressable accessibilityRole="button" onPress={retry}><Text style={styles.retryText}>Tentar novamente</Text></Pressable>
            </View>
          ) : null}
          {storageError ? <Text accessibilityRole="alert" style={styles.errorText}>{storageError}</Text> : null}
          {ready && apiLoading && !catalog.length ? <View style={styles.loading}><ActivityIndicator color="#2E7D32" /><Text style={styles.muted}>Carregando frutas…</Text></View> : null}
          {ready && !apiLoading && !catalog.length && !apiError ? <Text style={styles.muted}>A lista de frutas está vazia no momento.</Text> : null}
          {visibleFruits.map((fruit) => (
            <View key={fruit.id} style={styles.fruitRow}>
              <Pressable accessibilityRole="button" onPress={() => openFruit(fruit)} style={styles.fruitMain}>
                <View style={styles.fruitBadge}><Ionicons name="leaf-outline" size={20} color="#2E7D32" /></View>
                <View style={styles.fruitInfo}>
                  <Text style={styles.fruitName}>{fruitLabel(fruit.name)}</Text>
                  <Text style={styles.muted}>{formatNumber(fruit.nutritions.calories, 0)} kcal · 100 g</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#87958A" />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={favorites.includes(fruit.id) ? `Remover ${fruitLabel(fruit.name)} das favoritas` : `Adicionar ${fruitLabel(fruit.name)} às favoritas`} onPress={() => toggleFavorite(fruit.id)} style={styles.favoriteButton}>
                <Ionicons name={favorites.includes(fruit.id) ? 'heart' : 'heart-outline'} size={21} color={favorites.includes(fruit.id) ? '#D84343' : '#708174'} />
              </Pressable>
            </View>
          ))}
          {!filteredFruits.length && catalog.length ? <Text style={styles.emptySearch}>{favoritesOnly ? 'Você ainda não marcou frutas como favoritas.' : 'Nenhuma fruta encontrada. Tente outro nome.'}</Text> : null}
          {filteredFruits.length > 18 ? (
            <Pressable accessibilityRole="button" onPress={() => setShowAllFruits((value) => !value)} style={styles.showMore}>
              <Text style={styles.showMoreText}>{showAllFruits ? 'Mostrar menos' : `Mostrar mais ${filteredFruits.length - 18} frutas`}</Text>
            </Pressable>
          ) : null}
          <Text style={styles.disclaimer}>Dados fornecidos pela Fruityvice e apresentados por 100 g. A própria API informa que os valores podem conter imprecisões; use como referência geral.</Text>
          <Pressable accessibilityRole="link" onPress={openFruityvice} style={styles.sourceLink}>
            <Text style={styles.sourceLinkText}>Fonte dos dados: Fruityvice</Text>
            <Ionicons name="open-outline" size={15} color="#216B38" />
          </Pressable>
        </View>
      </ScrollView>

      <Modal transparent visible={!!selectedFruit} animationType="fade" onRequestClose={() => setSelectedFruit(null)}>
        <View style={styles.modalBackdrop}>
          {selectedFruit ? (
            <View style={styles.modalCard}>
              <View style={styles.modalHeading}>
                <View style={styles.modalFruitIcon}><Ionicons name="nutrition" size={25} color="#2E7D32" /></View>
                <View style={styles.modalTitleWrap}>
                  <Text style={styles.modalTitle}>{fruitLabel(selectedFruit.name)}</Text>
                  <Text style={styles.muted}>{selectedFruit.family || 'Fruta'}{selectedFruit.genus ? ` · ${selectedFruit.genus}` : ''}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Fechar detalhes da fruta" onPress={() => setSelectedFruit(null)} style={styles.iconButton}>
                  <Ionicons name="close" size={22} color="#425247" />
                </Pressable>
              </View>
              <Text style={styles.modalCaption}>Informações nutricionais aproximadas por 100 g</Text>
              <View style={styles.detailNutritionGrid}>
                <NutritionValue styles={styles} formatNumber={formatNumber} label="Energia" value={selectedFruit.nutritions.calories} unit="kcal" color="#2E7D32" />
                <NutritionValue styles={styles} formatNumber={formatNumber} label="Carboidratos" value={selectedFruit.nutritions.carbohydrates} />
                <NutritionValue styles={styles} formatNumber={formatNumber} label="Proteína" value={selectedFruit.nutritions.protein} />
                <NutritionValue styles={styles} formatNumber={formatNumber} label="Gordura" value={selectedFruit.nutritions.fat} />
                <NutritionValue styles={styles} formatNumber={formatNumber} label="Açúcares" value={selectedFruit.nutritions.sugar} />
              </View>
              <Text style={styles.muted}>Família: {selectedFruit.family || 'Não informada'} · Ordem: {selectedFruit.order || 'Não informada'}</Text>
              <View style={styles.gramInputRow}>
                <Text style={styles.gramLabel}>Quantidade para registrar</Text>
                <TextInput accessibilityLabel="Quantidade em gramas" value={grams} onChangeText={setGrams} keyboardType="decimal-pad" inputMode="decimal" maxLength={7} style={styles.gramInput} />
                <Text style={styles.gramLabel}>g</Text>
              </View>
              {!!message && <Text accessibilityRole="alert" style={styles.errorText}>{message}</Text>}
              <Pressable accessibilityRole="button" onPress={addSelectedFruit} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Adicionar ao diário de {dayLabel(selectedDate).toLowerCase()}</Text>
              </Pressable>
              <Text style={styles.disclaimer}>Estimativa calculada proporcionalmente a partir dos dados por 100 g.</Text>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F7F2' },
  content: { padding: 16, paddingBottom: 40, gap: 14, width: '100%', maxWidth: 760, alignSelf: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 20, backgroundColor: '#E8F5E9' },
  heroIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#FFFFFF' },
  heroText: { flex: 1, gap: 4 },
  heroTitle: { color: '#164A2A', fontSize: 18, fontWeight: '800' },
  heroBody: { color: '#4C6A52', fontSize: 13, lineHeight: 19 },
  card: { padding: 17, borderRadius: 20, backgroundColor: '#FFFFFF', gap: 13 },
  cardHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  headingText: { flex: 1, gap: 3 },
  sectionTitle: { color: '#1F3525', fontSize: 16, fontWeight: '800' },
  muted: { color: '#718074', fontSize: 12, lineHeight: 17 },
  calorieBadge: { alignItems: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#EAF6E9' },
  calorieValue: { color: '#216B38', fontSize: 22, fontWeight: '900' },
  calorieLabel: { color: '#4C6A52', fontSize: 10, fontWeight: '700' },
  macroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nutritionValue: { flex: 1, minWidth: 84, padding: 10, borderRadius: 13, backgroundColor: '#F4F8F3', gap: 3 },
  nutritionNumber: { color: '#33483A', fontSize: 15, fontWeight: '800' },
  nutritionUnit: { fontSize: 10, fontWeight: '700' },
  nutritionLabel: { color: '#718074', fontSize: 10 },
  smallNote: { color: '#718074', fontSize: 11, lineHeight: 16 },
  dateTabs: { flexDirection: 'row', gap: 7, paddingVertical: 2 },
  dateTab: { minHeight: 36, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F4EF' },
  dateTabSelected: { backgroundColor: '#2E7D32' },
  dateTabText: { color: '#58695B', fontSize: 11, fontWeight: '700' },
  dateTabTextSelected: { color: '#FFFFFF' },
  logItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderTopWidth: 1, borderColor: '#EDF1EC' },
  fruitDot: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#EAF6E9', alignItems: 'center', justifyContent: 'center' },
  logInfo: { flex: 1, gap: 3 },
  logTitle: { color: '#263A2B', fontSize: 14, fontWeight: '800' },
  iconButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F5F1' },
  emptyState: { minHeight: 88, alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 14, backgroundColor: '#F7F9F6' },
  refreshButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#EAF6E9' },
  searchWrap: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, borderRadius: 13, borderWidth: 1, borderColor: '#DFE7DE', backgroundColor: '#FBFCFA' },
  searchInput: { flex: 1, color: '#263A2B', fontSize: 13, outlineStyle: 'none' },
  filters: { flexDirection: 'row', gap: 8 },
  filterChip: { minHeight: 35, paddingHorizontal: 13, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F0' },
  filterChipSelected: { backgroundColor: '#E5F3E4' },
  filterChipText: { color: '#596A5C', fontSize: 12, fontWeight: '700' },
  filterChipTextSelected: { color: '#216B38' },
  fruitRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#EEF2EC', gap: 4 },
  fruitMain: { flex: 1, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fruitBadge: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#F0F7EF', alignItems: 'center', justifyContent: 'center' },
  fruitInfo: { flex: 1, gap: 4 },
  fruitName: { color: '#25392A', fontSize: 14, fontWeight: '800' },
  favoriteButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  apiMessage: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7, padding: 11, borderRadius: 12, backgroundColor: '#FFF7ED' },
  apiMessageText: { flex: 1, minWidth: 180, color: '#7C2D12', fontSize: 12, lineHeight: 17 },
  retryText: { color: '#216B38', fontSize: 12, fontWeight: '800' },
  loading: { minHeight: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  errorText: { color: '#B42318', fontSize: 12, lineHeight: 17 },
  emptySearch: { paddingVertical: 16, color: '#718074', fontSize: 13, textAlign: 'center' },
  showMore: { minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#F0F7EF' },
  showMoreText: { color: '#216B38', fontSize: 13, fontWeight: '800' },
  disclaimer: { color: '#7A887C', fontSize: 10, lineHeight: 15 },
  sourceLink: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 3 },
  sourceLinkText: { color: '#216B38', fontSize: 12, fontWeight: '800' },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 18, backgroundColor: 'rgba(20,35,24,0.55)' },
  modalCard: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 20, borderRadius: 22, backgroundColor: '#FFFFFF', gap: 15, maxHeight: '92%' },
  modalHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalFruitIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#EAF6E9', alignItems: 'center', justifyContent: 'center' },
  modalTitleWrap: { flex: 1, gap: 3 },
  modalTitle: { color: '#1F3525', fontSize: 20, fontWeight: '900' },
  modalCaption: { color: '#718074', fontSize: 12 },
  detailNutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gramInputRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  gramLabel: { color: '#526255', fontSize: 13, fontWeight: '700' },
  gramInput: { width: 90, minHeight: 43, borderWidth: 1, borderColor: '#D7E2D5', borderRadius: 12, paddingHorizontal: 11, color: '#263A2B', textAlign: 'center', fontWeight: '800', outlineStyle: 'none' },
  addButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 13, backgroundColor: '#2E7D32', paddingHorizontal: 12 },
  addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  pressed: { opacity: 0.76 },
});

