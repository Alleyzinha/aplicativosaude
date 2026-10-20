import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
export default function ProfileStat({ icon, label, value, styles }) { return <View style={styles.stat}><Ionicons name={icon} size={23} color={colors.primary} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }

