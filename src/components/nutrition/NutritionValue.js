import React from 'react';
import { View, Text } from 'react-native';
export default function NutritionValue({ label, value, unit = 'g', color, styles, formatNumber }) { return <View style={styles.nutritionValue}><Text style={[styles.nutritionNumber, color ? { color } : null]}>{formatNumber(value)}<Text style={styles.nutritionUnit}> {unit}</Text></Text><Text style={styles.nutritionLabel}>{label}</Text></View>; }

