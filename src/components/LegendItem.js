import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export default function LegendItem({ category, isActive }) {
  const { color, label, range, desc } = category;
  return (
    <View
      style={[
        styles.item,
        isActive && { borderColor: color, backgroundColor: color + '10' },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={[styles.range, { color }]}>{range}</Text>
      </View>
      <Text style={styles.desc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  range: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  desc: {
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 18,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
