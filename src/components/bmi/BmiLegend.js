import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LegendItem from '../LegendItem';
import { CATEGORIES } from '../../constants/imcCategories';

export default function BmiLegend({ activeCategory }) {
  return (
    <View style={styles.legendCard}>
      <Text style={styles.formTitle}>Faixas de classificação</Text>

      {CATEGORIES.map((c) => (
        <LegendItem
          key={c.key}
          category={c}
          isActive={activeCategory?.key === c.key}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#EEF1F6',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
});
