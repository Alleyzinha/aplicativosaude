import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BmiGauge from '../BmiGauge';

export default function BmiResultCard({ bmi, activeCategory }) {
  return (
    <View style={styles.gaugeCard}>
      <BmiGauge bmi={bmi} />

      {activeCategory ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultValue}>{bmi.toFixed(1)}</Text>
          <View
            style={[
              styles.resultBadge,
              { backgroundColor: activeCategory.color + '20' },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: activeCategory.color }]} />
            <Text style={[styles.resultBadgeText, { color: activeCategory.color }]}>
              {activeCategory.label}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.resultBox}>
          <Text style={styles.resultPlaceholder}>
            Preencha seus dados para calcular
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF1F6',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  resultBox: {
    marginTop: 6,
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1E293B',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
    gap: 6,
  },
  resultBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
