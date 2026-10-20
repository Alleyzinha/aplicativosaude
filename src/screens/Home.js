import { HEALTH_ITEMS } from '../constants/healthItems';
import React from 'react';
import { StyleSheet, FlatList, SafeAreaView, StatusBar } from 'react-native';
import Header from '../components/Header';
import HealthCard, { NUM_COLUMNS } from '../components/HealthCard';

const H_PADDING = 16;
const CARD_GAP = 12;



export default function HomeScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <HealthCard
      item={item}
      onPress={() => item.screen && navigation.navigate(item.screen)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2B46" />

      <Header
        title="Saúde & Bem-Estar"
        subtitle="Acompanhe sua saúde de forma simples e organizada"
      />

      <FlatList
        data={HEALTH_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  gridContainer: {
    paddingHorizontal: H_PADDING,
    paddingTop: 20,
    paddingBottom: 28,
  },
  row: {
    justifyContent: 'flex-start',
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
});

